using Microsoft.EntityFrameworkCore.Migrations;

namespace StockTracker.Migrations
{
    public partial class FixDeviceTypename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_DeviceType_DeviceTypeId",
                table: "Devices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeviceType",
                table: "DeviceType");

            migrationBuilder.RenameTable(
                name: "DeviceType",
                newName: "DeviceTypes");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeviceTypes",
                table: "DeviceTypes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_DeviceTypes_DeviceTypeId",
                table: "Devices",
                column: "DeviceTypeId",
                principalTable: "DeviceTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_DeviceTypes_DeviceTypeId",
                table: "Devices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeviceTypes",
                table: "DeviceTypes");

            migrationBuilder.RenameTable(
                name: "DeviceTypes",
                newName: "DeviceType");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeviceType",
                table: "DeviceType",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_DeviceType_DeviceTypeId",
                table: "Devices",
                column: "DeviceTypeId",
                principalTable: "DeviceType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
