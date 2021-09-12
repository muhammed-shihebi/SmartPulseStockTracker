using ConsoleApp.Model;
using Microsoft.EntityFrameworkCore;


namespace ConsoleApp.Data
{
    class AppDBContext: DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(
                "data source=host.docker.internal,5434;initial catalog=master;Trusted_Connection=false;User Id=SA; " +
                "Password=Pass@word; database=StockTrakerDB");
        }

        public DbSet<DeviceType> DeviceTypes { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<Santral> Santrals { get; set; }
        public DbSet<Organization> Organizations { get; set; }
    }
}
