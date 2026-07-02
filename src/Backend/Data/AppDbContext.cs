using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<User> Users { get; set; }
    public DbSet<UserSettings> UserSettings { get; set; }
    public DbSet<Medication> Medications { get; set; }
    public DbSet<MedicationSchedule> MedicationSchedules { get; set; }
    public DbSet<ChangeRequest> ChangeRequests { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<ChatSession> ChatSessions { get; set; }
    public DbSet<Examination> Examinations { get; set; }
    public DbSet<FamilyMember> FamilyMembers { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FamilyMember>()
            .HasOne<User>(f => f.Owner)
            .WithMany(u => u.OwnedRelations)
            .HasForeignKey(f => f.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<FamilyMember>()
            .HasOne<User>(f => f.Member)
            .WithMany(u => u.MemberRelations)
            .HasForeignKey(f => f.MemberId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<ChangeRequest>()
            .HasOne<User>(cr => cr.CreatedBy)
            .WithMany(u => u.CreatedChangeRequests)
            .HasForeignKey(cr => cr.RequestedBy)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<ChangeRequest>()
            .HasOne<User>(cr => cr.Reviewer)
            .WithMany(u => u.ReviewedChangeRequests)
            .HasForeignKey(u => u.ReviewedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}