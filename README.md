# Mumps vaccine risk-benefit dashboard

Static GitHub Pages dashboard for a simple mumps vaccine risk-benefit model.

## Current model

This version uses a **cohort Markov model**.

- Population: hypothetical cohort of 100,000 children at the target age for vaccination
- Vaccination: administered once at cohort entry according to the selected coverage
- Time horizon: adjustable follow-up period X, from 1 to 20 years
- Outcome: cumulative aseptic meningitis cases per 100,000 cohort

The model adds vaccine-associated aseptic meningitis once at cohort entry, then accumulates infection-associated aseptic meningitis over the follow-up period.

## Adjustable parameters

- Vaccine coverage
- Follow-up period X
- Annual mumps incidence without vaccination
- Aseptic meningitis after mumps infection
- Vaccine-associated aseptic meningitis
- Initial vaccine effectiveness
- Annual waning of vaccine effectiveness
- Basic reproduction number R0

## How to publish on GitHub Pages

1. Create a new repository.
2. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
3. Go to Settings → Pages.
4. Set source to `Deploy from a branch`, branch `main`, folder `/root`.
5. Open the GitHub Pages URL after deployment.

## Notes

This is a conceptual model for discussion. It does not fully represent age structure, contact structure, cyclic epidemics, real-world vaccine schedules, detailed waning immunity, or cost-effectiveness outcomes. Future versions may add mumps-associated hearing loss and other outcomes.
