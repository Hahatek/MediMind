using System.ComponentModel.DataAnnotations;
using Backend.Helpers;

namespace Backend.DTOs.AccessCode;

public class CreateAccessCodeDto
{
    [Required] [EnumDataType(typeof(CodeActionType))] public CodeActionType? ActionType { get; set; }
}
