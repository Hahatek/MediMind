using Backend.Helpers;

namespace Backend.Models;

public class Medication
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public string? Strength { get; set; } // moc leku jako tekst, np. "5 mg", "875/125 mg"; null = nie podano
    public string Form { get; set; } // postać, np. "tabletka" — jednostka dla MedicationSchedule.Amount
    public string? Notes { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; } // null = bez określonej daty zakończenia
    public DateOnly? DiscontinuedOn { get; set; } // od tego dnia lek jest odstawiony (ustawiane tylko przez /discontinue)
    public ICollection<MedicationSchedule> MedicationSchedules { get; set; } = new List<MedicationSchedule>();
    public User User { get; set; }

    // Jedyne źródło logiki aktywności leku — używają go /today, lista leków i POST MedicationIntake.
    // day to lokalna data użytkownika przekazana z telefonu.
    public MedicationStatus GetStatusOn(DateOnly day)
    {
        if (StartDate != null && day < StartDate)
        {
            return MedicationStatus.Planned;
        }

        if (DiscontinuedOn != null && DiscontinuedOn <= day)
        {
            return MedicationStatus.Discontinued;
        }

        if (EndDate != null && EndDate < day)
        {
            return MedicationStatus.Finished;
        }

        return MedicationStatus.Active;
    }
}
