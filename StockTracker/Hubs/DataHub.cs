using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StockTracker.Data;
using StockTracker.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace StockTracker.Hubs
{
    public class DataHub : Hub
    {
        /*        private AppDBContext _context;
                public DataHub(AppDBContext database)
                {
                    _context = database;
                }
        */

        // not called until other function is done. 
        public override Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine("OnDisconnectedAsync called");
            return base.OnDisconnectedAsync(exception);
        }

        public async Task GetData()
        {
            while (true)
            {
                if (Context.ConnectionAborted.IsCancellationRequested)
                {
                    break; 
                }
                var contextOptions = new DbContextOptionsBuilder<AppDBContext>()
                    .UseSqlServer(Startup.connectionString)
                    .Options;
                using (var context = new AppDBContext(contextOptions))
                {
                    var oldSantrals = await context.Santrals
                        .Include(s => s.Devices)
                        .ThenInclude(d => d.DeviceType)
                        .OrderBy(s => s.Name)
                        .ToListAsync();

                    // resturcture the data to avoid
                    // "System.Text.Json.JsonException: A possible object cycle was detected which is not supported"  error 
                    // santral -> devices -> deviceType -> devices -> deviceType : cycle!

                    var santrals = new List<Santral>();

                    foreach (var oldSantral in oldSantrals)
                    {
                        context.Entry<Santral>(oldSantral).Reload();

                        var newSantral = new Santral
                        {
                            Id = oldSantral.Id,
                            Name = oldSantral.Name,
                            Eic = oldSantral.Eic,
                            OrganizationId = oldSantral.OrganizationId,
                            Organization = oldSantral.Organization,
                            Devices = new List<Device>()
                        };

                        foreach (var device in oldSantral.Devices)
                        {
                            var newDevice = new Device
                            {
                                Id = device.Id,
                                SerialNum = device.SerialNum,
                                State = device.State,
                                Message = device.Message,
                                DeviceTypeId = device.DeviceTypeId,
                                SantralId = device.SantralId
                            };

                            var newDeviceType = new DeviceType
                            {
                                Id = device.DeviceType.Id,
                                Name = device.DeviceType.Name
                            };

                            newDevice.DeviceType = newDeviceType;

                            newSantral.Devices.Add(newDevice);
                        }
                        santrals.Add(newSantral);
                    }
                    await Clients.All.SendAsync("ReceiveData", santrals);
                    Console.WriteLine("runnding ...");
                    Thread.Sleep(5000);
                }
            }
        }
    }
}