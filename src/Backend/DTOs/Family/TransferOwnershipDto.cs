namespace Backend.DTOs.Family;

public class TransferOwnershipDto
{
    public Guid? NewOwnerId { get; set; }
    public bool AlsoLeaveFamily { get; set; }
}