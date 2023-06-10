describe('Automated Test for Customer Feedback', () => {
  it('Visits the Juice Shop website and submits customer feedback', () => {
    cy.visit('https://juice-shop.herokuapp.com/');

    cy.get('button.close-dialog').click();

    // Find the dismiss button element using its class or attributes
cy.get('a.cc-dismiss[aria-label="dismiss cookie message"]')

  // Click on the dismiss button
  .click();


    // Navigate to the 'Customer Feedback' page
    cy.get('button[aria-label="Open Sidenav"]').click();
    cy.contains('Customer Feedback').click();
    cy.url().should('eq', 'https://juice-shop.herokuapp.com/#/contact');
    cy.contains('Customer Feedback').should('exist');

it('should display the form fields', () => {
    cy.get('mat-card').should('be.visible');
    cy.get('h1').should('contain', 'Customer Feedback');
    cy.get('#feedback-form').should('exist');
    cy.get('#userId').should('be.hidden');
    cy.get('#mat-input-1').should('be.disabled');
    cy.get('#comment').should('be.visible');
    cy.get('#rating').should('exist');
    cy.get('#captcha').should('exist');
    cy.get('#captchaControl').should('be.visible');
    cy.get('#submitButton').should('be.visible');
  });

  it('should validate and submit the form', () => {
    // Fill in the form fields
    //cy.get('#mat-input-1').type('John Doe');
    cy.get('#comment').type('This is a test feedback');
    cy.get('#rating').invoke('val', 5).trigger('change');
    cy.get('#captchaControl').type('48');

    // Submit the form
    cy.get('#submitButton').click();

    // Verify the form submission
    // Add assertions or API requests to validate the form submission
    // Example: cy.request(...)
  });

  it('should display an error for invalid CAPTCHA result', () => {
    // Fill in the form fields
    //cy.get('#mat-input-1').type('John Doe');
    cy.get('#comment').type('This is a test feedback');
    cy.get('#rating').invoke('val', 5).trigger('change');
    cy.get('#captchaControl').type('123'); // Invalid CAPTCHA result

    // Submit the form
    cy.get('#submitButton').click();

    // Verify the error message
    cy.contains('Please enter the result of the CAPTCHA.').should('be.visible');
  });

  // Add more test cases to cover different scenarios and validations

});
  })