using Microsoft.EntityFrameworkCore.Migrations;

namespace StockTracker.Migrations
{
    public partial class addstateandmessageproperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "Devices",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "State",
                table: "Devices",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Message",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Devices");
        }
    }
}
