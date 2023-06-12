describe('Automated Test for Customer Feedback', () => {
  const testCases = [
    {
      comment: 'Test comment',
      rating: 3,
      captcha: '12345',
      isValid: true,
    },
    {
      comment: '',
      rating: 3,
      captcha: '12345',
      isValid: false,
      errorMessage: 'Please provide a comment.',
    },
    {
      comment: 'Test comment',
      rating: 3,
      captcha: '@#$',
      isValid: false,
      errorMessage: 'Invalid CAPTCHA code',
    },
    {
      comment: 'Test comment',
      rating: 3,
      captcha: '',
      isValid: false,
      errorMessage: 'Please enter the result of the CAPTCHA.',
    },

     
  ];

  beforeEach(() => {
    cy.visit('https://juice-shop.herokuapp.com/', { target: '_blank' });
    cy.get('button.close-dialog').click();
    cy.get('a.cc-dismiss[aria-label="dismiss cookie message"]').click();
    cy.get('button[aria-label="Open Sidenav"]').click();
    cy.contains('Customer Feedback').click();
    cy.url().should('eq', 'https://juice-shop.herokuapp.com/#/contact');
    cy.contains('Customer Feedback').should('exist');
  });

  it('Visits the Juice Shop website and submits customer feedback', () => {
    cy.get('button[aria-label="Button to send the review"]').as('submitButton');
    cy.get('@submitButton').should('be.disabled');
    cy.get('#mat-input-1').invoke('val', 'anonymous').should('have.value', 'anonymous');
    cy.get('textarea[aria-label="Field for entering the comment or the feedback"]').as('commentField');
    cy.get('mat-slider[aria-label="Slider for selecting the star rating"]').as('ratingSlider');
    cy.get('input[aria-label="Field for the result of the CAPTCHA code"]').as('captchaField');


    testCases.forEach(({ comment, rating, captcha, isValid, errorMessage }) => {
      // Validate comment field
      cy.get('@commentField').then(($commentField) => {
        if (comment.trim() === '') {
          cy.get('@commentField').clear().invoke('val', ' ');
        } else {
          cy.get('@commentField').clear().type(comment);
        }
      });

      cy.get('@ratingSlider').invoke('val', rating).trigger('change').click({ force: true });
      
      // Validate captcha field
      cy.get('@captchaField').then((captchaField) => {
        if (captcha.trim() === '') {
          cy.get('@captchaField').clear().invoke('val', ' ');
        } else {
          cy.get('@captchaField').clear().type(captcha);
        }
      });
      

cy.get('@submitButton').then((submitButton) => {
  if (isValid) {
    expect(submitButton).not.to.have.attr('disabled');
  } else {
    cy.wrap(submitButton).should('be.disabled').then(() => {
      // Additional assertions or actions if needed
    });
  }
});

      if (!isValid) {
        cy.get('.mat-error').should('contain.text', errorMessage);
      } else {
        cy.intercept('POST', '**/api/Feedbacks').as('submitFeedback');
        cy.get('@submitButton').click({ force: true });
        cy.wait('@submitFeedback').then((interception) => {
          const { body } = interception.request;
          // Validate the comment value
          if (comment.trim() === '') {
            expect(body.comment).to.equal(' (anonymous)');
          } else {
            expect(body.comment).to.equal(`${comment} (anonymous)`);
          }

          expect(body.rating).to.equal(rating);
          expect(body.captcha).to.equal(captcha);
          expect(interception.response.statusCode).not.to.equal(201);
          cy.get('.mat-simple-snack-bar-content').should('be.visible');
        });
      }
    });
  });
});

