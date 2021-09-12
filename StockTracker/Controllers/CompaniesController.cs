using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StockTracker.Data;
using StockTracker.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace StockTracker.Controllers
{
    [ApiController]
    public class CompnaiesController : ControllerBase
    {
        private readonly ILogger<CompnaiesController> _logger;
        private readonly AppDBContext _database;

        public CompnaiesController(ILogger<CompnaiesController> logger, AppDBContext database)
        {
            _logger = logger;
            _database = database;
        }

        // this function is used once to loade the data of the santrals to the database
        [HttpPost("loadSantarlsToDB")]
        public async Task LoadSantarlsToDB()
        {
            Console.WriteLine("loadSantarlsToDB got called ");
            HttpClient client = new HttpClient();
            string OrgaResponse = await client.GetStringAsync("https://seffaflik.epias.com.tr/transparency/service/production/dpp-organization");
            JsonElement Jresponse = JsonDocument.Parse(OrgaResponse).RootElement; // string to JsonElement

            foreach (var orga in Jresponse.GetProperty("body").GetProperty("organizations").EnumerateArray())
            {
                bool isOver = false;
                while (!isOver)
                {
                    Thread.Sleep(500);

                    string uri = "https://seffaflik.epias.com.tr/transparency/service/production/dpp-injection-unit-name?organizationEIC=" + orga.GetProperty("organizationETSOCode").GetString();
                    var santralResponse = await client.GetAsync(uri);

                    if (santralResponse.IsSuccessStatusCode)
                    {
                        HttpContent content = santralResponse.Content;
                        string jsonContent = await content.ReadAsStringAsync();
                        JsonElement JSantralResponse = JsonDocument.Parse(jsonContent).RootElement; // parse json string to JsonElement 

                        var santrals = JSantralResponse.GetProperty("body").GetProperty("injectionUnitNames");

                        Organization newOrga = new Organization()
                        {
                            OrganizationId = orga.GetProperty("organizationId").GetInt32(),
                            OrganizationName = orga.GetProperty("organizationName").GetString(),
                            OrganizationStatus = orga.GetProperty("organizationStatus").GetString(),
                            OrganizationETSOCode = orga.GetProperty("organizationETSOCode").GetString(),
                            OrganizationShortName = orga.GetProperty("organizationShortName").GetString()

                        };

                        _database.Organizations.Add(newOrga);
                        _database.SaveChanges();

                        var query = _database.Organizations.Where(orga => orga.OrganizationId == newOrga.OrganizationId).FirstOrDefault();

                        foreach (var santral in santrals.EnumerateArray())
                        {
                            Santral newSantral = new Santral()
                            {
                                Name = santral.GetProperty("name").GetString(),
                                Eic = santral.GetProperty("eic").GetString(),
                                OrganizationId = query.Id
                            };

                            _database.Santrals.Add(newSantral);
                            _database.SaveChanges();
                        }

                        Console.WriteLine(orga.GetProperty("organizationName").GetString() + " is added");
                        isOver = true;
                    }
                    else
                    {
                        Console.WriteLine("The request failed");
                    }
                }
            }
        }

        [HttpGet("GetSantralsWithDevices")]
        public IActionResult getSantralsWithDevices()
        {
            try
            {
                var allSantrals = _database.Santrals
                    .Include(s => s.Devices)
                    .ThenInclude(d => d.DeviceType)
                    .OrderBy(s => s.Name);
                return Ok(allSantrals);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, " Error Getting Santrals");
            }
        }
    }
}
