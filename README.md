# Mumps vaccine benefit-risk dashboard

Static GitHub Pages dashboard for a simple cohort Markov model of mumps vaccination and aseptic meningitis.

## Model definition

- Cohort: hypothetical 100,000 children at vaccination age
- Vaccination: at cohort entry
- Follow-up: X years, selected by slider
- Outcome: cumulative aseptic meningitis per 100,000 cohort
- Vaccine-associated aseptic meningitis: counted once at cohort entry
- Infection-associated aseptic meningitis: accumulated during follow-up

## Current summary panel

The top summary panel displays the currently selected scenario:

- Vaccine-associated aseptic meningitis
- Infection-associated aseptic meningitis
- Prevented infection-associated aseptic meningitis
- Total aseptic meningitis
- Benefit-risk ratio

## Files

- `index.html`
- `style.css`
- `app.js`

Upload these files to the root of a GitHub repository and enable GitHub Pages.
