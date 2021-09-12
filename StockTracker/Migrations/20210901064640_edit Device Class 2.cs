using Microsoft.EntityFrameworkCore.Migrations;

namespace StockTracker.Migrations
{
    public partial class editDeviceClass2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Devices");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Devices",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
