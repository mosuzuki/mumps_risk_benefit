# Mumps vaccine benefit-risk dashboard

Static GitHub Pages dashboard for a simplified cohort Markov model of mumps vaccination.

## Model definition

- Population: hypothetical cohort of 100,000 children at vaccination age
- Vaccination: at cohort entry
- Follow-up: 1–10 years, default 5 years
- Vaccine-associated aseptic meningitis is added once at vaccination
- Infection-associated aseptic meningitis accumulates over follow-up
- Vaccine protection wanes annually
- Natural infection confers non-waning immunity in this simplified model
- Infection risk is approximated using the susceptible fraction and R0

This is a conceptual model for discussion, not a formal policy model.
