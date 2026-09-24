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
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<GoogleCalendarConnection> GoogleCalendarConnections { get; set; }
    public DbSet<GoogleFitConnection> GoogleFitConnections { get; set; }
    
    public DbSet<Family> Families { get; set; }
    public DbSet<FamilyMembership> FamilyMemberships { get; set; }
    public DbSet<FamilyInvite> FamilyInvites { get; set; }
    
    public DbSet<ExaminationHide> ExaminationsHide { get; set; }

    public DbSet<MedicationIntake> MedicationIntakes { get; set; }

    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
        
        modelBuilder.Entity<GoogleCalendarConnection>()
            .HasIndex(g => g.UserId)
            .IsUnique();

        modelBuilder.Entity<GoogleFitConnection>()
            .HasIndex(g => g.UserId)
            .IsUnique();
        
        modelBuilder.Entity<FamilyMembership>()
            .HasOne(fm => fm.Family)
            .WithMany(f => f.Memberships)
            .HasForeignKey(fm => fm.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<FamilyMembership>()
            .HasOne(fm => fm.User)
            .WithMany(u => u.FamilyMemberships)
            .HasForeignKey(fm => fm.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<FamilyMembership>()
            .HasIndex(fm => new { fm.FamilyId, fm.UserId })
            .IsUnique();
        
        modelBuilder.Entity<FamilyInvite>()
            .HasOne(fi => fi.Family)
            .WithMany()
            .HasForeignKey(fi => fi.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyInvite>()
            .HasOne(fi => fi.CreatedBy)
            .WithMany()
            .HasForeignKey(fi => fi.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<ExaminationHide>()
            .HasOne(exh => exh.HiddenByUser)
            .WithMany()
            .HasForeignKey(exh => exh.HiddenByUserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<ExaminationHide>()
            .HasOne(exh => exh.HiddenForUser)
            .WithMany()
            .HasForeignKey(exh => exh.HiddenForUserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<ExaminationHide>()
            .HasIndex(exh => new { exh.ExaminationId, exh.HiddenForUserId })
            .IsUnique();

        modelBuilder.Entity<MedicationIntake>()
            .HasOne(mi => mi.MedicationSchedule)
            .WithMany()
            .HasForeignKey(mi => mi.MedicationScheduleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MedicationIntake>()
            .HasOne(mi => mi.User)
            .WithMany()
            .HasForeignKey(mi => mi.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MedicationIntake>()
            .HasIndex(mi => new { mi.MedicationScheduleId, mi.Date })
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.TokenHash)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}