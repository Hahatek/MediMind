using Backend.DTOs.MedicationSchedule;
using Backend.Helpers;

namespace Backend.DTOs.Medication;

// Element listy leków ("kartka na lodówce"): lek + status wyliczony dla daty z telefonu + jego pory
public class MedicationListItemDto : ResponseMedicationDto
{
    public MedicationStatus Status { get; set; }
    public List<ResponseMedicationScheduleDto> Schedules { get; set; } = new();
}
