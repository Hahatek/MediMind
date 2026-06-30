using System.ComponentModel;

namespace Backend.Helpers;

public enum BloodType
{
 
    [Description("A+")]
    APlus = 0,
    [Description("A-")]
    AMinus = 1,
    

    [Description("B+")]
    BPlus = 2,
    [Description("B-")]
    BMinus = 3,


    [Description("0+")]
    ZeroPlus = 4,
    [Description("0-")]
    ZeroMinus = 5,
    
    [Description("AB+")]
    ABPlus = 6,
    [Description("AB-")]
    ABMinus = 7,
}

public enum RoleUser
{
    Child,
    Senior,
    Adult
    
}

public enum Gender
{
    Male,
    Female,
    Other,
}

public enum ExaminationsStatus
{
    Sudden,
    Pending,
    Scheduled,
    InProgress,
    Planned,
    Skipped,
    Completed,
}

public enum MedicationTime
{
    Morning,
    Afternoon,
    Evening,
    BeforeSleep 
}

public enum AuthorChat
{
    ChatBot,
    User
}

public enum NotificationType
{
    Reminder,
    Suggestion,
    FamilyAlert
}

public enum ChangeRequestStatus
{
    Pending,
    Approved,
    Rejected
}