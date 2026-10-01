using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<User> Users { get; set; }
    public DbSet<UserAccount> UserAccounts { get; set; }
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

    public DbSet<UserDevice> UserDevices { get; set; }

    public DbSet<ProfileAccessCode> ProfileAccessCodes { get; set; }

    public DbSet<Guardianship> Guardianships { get; set; }

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
        
        modelBuilder.Entity<Examination>()
            .HasOne<User>()                              
            .WithMany()                                  
            .HasForeignKey(e => e.CompletedByUserId)    
            .OnDelete(DeleteBehavior.SetNull);       
        
        modelBuilder.Entity<Medication>(m =>
        {
            m.Property(x => x.Name).HasMaxLength(200);
            m.Property(x => x.Strength).HasMaxLength(100);
            m.Property(x => x.Form).HasMaxLength(50);
            m.Property(x => x.Notes).HasMaxLength(1000);
        });

        modelBuilder.Entity<MedicationSchedule>()
            .Property(ms => ms.Amount)
            .HasPrecision(8, 2);

        modelBuilder.Entity<MedicationIntake>()
            .Property(mi => mi.ScheduledAmount)
            .HasPrecision(8, 2);

        // NoAction zamiast Cascade: usunięcie harmonogramu nie może skasować historii przyjęć.
        // Kontrolery zwracają 409, gdy historia istnieje — to jest dodatkowa blokada na poziomie bazy.
        modelBuilder.Entity<MedicationIntake>()
            .HasOne(mi => mi.MedicationSchedule)
            .WithMany()
            .HasForeignKey(mi => mi.MedicationScheduleId)
            .OnDelete(DeleteBehavior.NoAction);

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

        // UserDevice = "to urządzenie ma dostęp do tego profilu". Nie to samo co UserAccount:
        // profil bez konta (np. dziecko) też może mieć urządzenie. Dostępu nie kasujemy, tylko ustawiamy RevokedAt.
        modelBuilder.Entity<UserDevice>()
            .HasOne(d => d.User)
            .WithMany()
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserDevice>()
            .HasIndex(d => d.UserId);

        // Każdy RefreshToken należy do urządzenia. Odwołanie urządzenia unieważnia cały łańcuch jego tokenów.
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.Device)
            .WithMany()
            .HasForeignKey(rt => rt.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.DeviceId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // UserAccount = opcjonalny login (1:0..1). Klucz główny to jednocześnie FK do User,
        // więc jedna osoba ma najwyżej jedno konto. Usunięcie konta nie rusza User.
        modelBuilder.Entity<UserAccount>()
            .HasKey(ua => ua.UserId);

        modelBuilder.Entity<UserAccount>()
            .HasOne(ua => ua.User)
            .WithOne(u => u.Account)
            .HasForeignKey<UserAccount>(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserAccount>()
            .HasIndex(ua => ua.Email)
            .IsUnique();

        // Guardianship = "GuardianUser może zarządzać profilem WardUser". Reguły dotyczące wielu wierszy pilnuje baza.
        // Restrict na opiekunie: nie da się usunąć osoby, która jest czyimś opiekunem (np. Primary) bez rozwiązania opieki.
        modelBuilder.Entity<Guardianship>()
            .HasOne(g => g.GuardianUser)
            .WithMany()
            .HasForeignKey(g => g.GuardianUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cascade na podopiecznym: usunięcie profilu podopiecznego usuwa relacje opieki, które go dotyczą.
        modelBuilder.Entity<Guardianship>()
            .HasOne(g => g.WardUser)
            .WithMany()
            .HasForeignKey(g => g.WardUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Guardianship>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Guardianships_GuardianNotWard", "\"GuardianUserId\" <> \"WardUserId\""));

        modelBuilder.Entity<Guardianship>()
            .HasIndex(g => new { g.GuardianUserId, g.WardUserId })
            .IsUnique();

        // Najwyżej jeden Primary na podopiecznego. "Co najmniej jeden" pilnują operacje (CreateManagedProfile, TransferPrimary).
        modelBuilder.Entity<Guardianship>()
            .HasIndex(g => g.WardUserId)
            .IsUnique()
            .HasFilter("\"IsPrimary\"")
            .HasDatabaseName("IX_Guardianships_WardUserId_Primary");

        modelBuilder.Entity<MedicationIntake>()
            .HasOne<User>()                              
            .WithMany()                                  
            .HasForeignKey(mi => mi.RecordedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // ProfileAccessCode = jednorazowy kod dostępu do ISTNIEJĄCEGO profilu (LinkDevice / ClaimProfile).
        // W bazie jest tylko HMAC kodu. Wiersze są krótkotrwałe, więc znikają razem z osobą (Cascade po obu stronach).
        modelBuilder.Entity<ProfileAccessCode>(c =>
        {
            c.Property(x => x.CodeHash).HasMaxLength(64);

            c.HasOne(x => x.TargetUser)
                .WithMany()
                .HasForeignKey(x => x.TargetUserId)
                .OnDelete(DeleteBehavior.Cascade);

            c.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // "Żywy" kod = niezużyty i nieunieważniony. Wygasłe unieważnia usługa przy generowaniu nowego.
            // Najwyżej jeden żywy kod na parę (profil, cel) — nowy unieważnia poprzedni.
            c.HasIndex(x => new { x.TargetUserId, x.ActionType })
                .IsUnique()
                .HasFilter("\"ConsumedAt\" IS NULL AND \"RevokedAt\" IS NULL")
                .HasDatabaseName("IX_ProfileAccessCodes_Target_ActionType_Live");

            // Kodu szukamy po samym HMAC, więc wśród żywych kodów nie może być dwóch takich samych.
            c.HasIndex(x => x.CodeHash)
                .IsUnique()
                .HasFilter("\"ConsumedAt\" IS NULL AND \"RevokedAt\" IS NULL")
                .HasDatabaseName("IX_ProfileAccessCodes_CodeHash_Live");
        });
    }
}