# Mumps vaccine risk-benefit dashboard

This is a static GitHub Pages dashboard for a simplified cohort Markov model of mumps vaccination and aseptic meningitis.

## Model definition

- Population: hypothetical cohort of 100,000 children at vaccination age
- Vaccination: administered once at cohort entry according to selected coverage
- Time horizon: user-selected follow-up period X years
- Outcome: cumulative aseptic meningitis cases per 100,000 cohort
- Vaccine-associated aseptic meningitis: added once at cohort entry
- Infection-associated aseptic meningitis: accumulated annually over the follow-up period

## Parameters

- Vaccine coverage: 0-100%
- Follow-up period: 1-20 years
- Annual mumps incidence without vaccination: 2,000-5,000 per 100,000 person-years
- Aseptic meningitis after mumps infection: 5-10 per 1,000 infections
- Vaccine-associated aseptic meningitis: 5-50 per 100,000 vaccinees
- Initial vaccine effectiveness: 72% or 86%
- Annual waning: 0-5% per year
- R0: 4-7

## Notes

This is a conceptual model. It is not a full dynamic age-structured transmission model. It is intended to show that vaccine-associated meningitis is a one-time short-term risk, whereas infection-associated meningitis accumulates over the follow-up period.

Future versions may add hearing loss, encephalitis, orchitis, hospitalization, QALYs, and cost-effectiveness outputs.
