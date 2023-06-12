describe('Automated Test for Customer Feedback', () => {
  it('Visits the Juice Shop website and submits customer feedback', () => {
    cy.visit('https://juice-shop.herokuapp.com/');

    cy.get('button.close-dialog').click();

    // Find the dismiss button element using its class or attributes
    cy.get('a.cc-dismiss[aria-label="dismiss cookie message"]')
      .click();

    // Navigate to the 'Customer Feedback' page
    cy.get('button[aria-label="Open Sidenav"]').click();
    cy.contains('Customer Feedback').click();
    cy.url().should('eq', 'https://juice-shop.herokuapp.com/#/contact');
    cy.contains('Customer Feedback').should('exist');

    // Find the submit button
    cy.get('button[aria-label="Button to send the review"]').as('submitButton');

    // Validate initial state - button should be disabled
    cy.get('@submitButton').should('be.disabled');

    // Set the value of the hidden field
    cy.get('#mat-input-1')
      .invoke('val', 'anonymous');

    // Validate the value of the hidden field
    cy.get('#mat-input-1')
      .should('have.value', 'anonymous');

    // Validate comment field
    cy.get('textarea[aria-label="Field for entering the comment or the feedback"]')
      .type('Test comment')
      .should('have.value', 'Test comment');

    // Validate the Rating field
    cy.get('mat-slider[aria-label="Slider for selecting the star rating"]')
      .invoke('val', 3) // Set the value of the slider (60 corresponds to 3 stars out of 5)
      .trigger('change') // Trigger a change event to reflect the updated value
      .click({ force: true })
      .should('have.attr', 'aria-valuenow', '3'); // Validate the rating value

    // Declare the result variable
    let result;

    // Get the CAPTCHA code element
    cy.get('code[aria-label="CAPTCHA code which must be solved"]').then(($captchaCode) => {
      const captchaCode = $captchaCode.text(); // Get the CAPTCHA code text

      // Calculate the CAPTCHA result
      result = eval(captchaCode); // Perform the calculation on the CAPTCHA code

      // Enter the result in the CAPTCHA input field
      cy.get('input[aria-label="Field for the result of the CAPTCHA code"]').type(result);

      // Validate the CAPTCHA result
      cy.get('input[aria-label="Field for the result of the CAPTCHA code"]').should('have.value', result.toString());

      // Enable the submit button (if necessary)
      cy.get('@submitButton').should('not.be.disabled');

      // Click the submit button
      cy.get('@submitButton').click({force: true});

      // Intercept the form submission request
      cy.intercept('POST', '**/api/Feedbacks').as('submitFeedback');

      // Intercept the form submission response
      cy.get('@submitButton').click({ force: true }).then(() => {
        cy.wait('@submitFeedback').then((interception) => {
          // Assert the request payload
          const { body } = interception.request;
          expect(body.comment).to.equal('Test comment (anonymous)');
          expect(body.rating).to.equal(3);
          expect(body.captcha).to.equal(result.toString());

          // Checked assertion of the response status code
          expect(interception.response.statusCode).to.equal(201);

          // Checked assertion that a success message is displayed after submitting the form
          cy.get('.mat-simple-snack-bar-content').should('be.visible');
        });
      });
    });
  });
});

