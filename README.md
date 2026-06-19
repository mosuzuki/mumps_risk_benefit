# Mumps vaccine risk-benefit dashboard

Static GitHub Pages dashboard for a simple mumps vaccine risk-benefit model. This version is explicitly defined as an annual incidence model.

## Model definition

This dashboard is an **annual incidence model**. It compares aseptic meningitis outcomes per 100,000 children per year according to vaccine coverage. It is not a birth-cohort follow-up model.

- Population denominator: 100,000 children in the target age group
- Time horizon: 1 year
- Main outcome: aseptic meningitis per 100,000 person-years
- Future version: additional outcomes such as mumps-associated hearing loss

## What it shows

- Natural infection-associated aseptic meningitis
- Vaccine-associated aseptic meningitis
- Total aseptic meningitis
- Sensitivity to vaccine coverage and assumptions

## How to publish on GitHub Pages

1. Create a new repository.
2. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
3. Go to Settings → Pages.
4. Set source to `Deploy from a branch`, branch `main`, folder `/root`.
5. Open the GitHub Pages URL after deployment.

## Notes

This is a conceptual model for discussion. It does not fully represent age structure, contact structure, cyclic epidemics, waning immunity, multi-year cumulative risk, or cost-effectiveness outcomes. Hearing loss and other mumps complications are planned for a future version.
