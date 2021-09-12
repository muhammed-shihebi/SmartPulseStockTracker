using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StockTracker.Data;
using StockTracker.Model;
using StockTracker.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace StockTracker.Controllers
{
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly ILogger<InventoryController> _logger;
        private readonly AppDBContext _database;

        public InventoryController(ILogger<InventoryController> logger, AppDBContext database)
        {
            _logger = logger;
            _database = database;
        }

        // =========================================================== Device Type

        [HttpGet("GetSantrals")]
        public IActionResult GetSantrals()
        {
            try
            {
                var allSantrals = _database.Santrals
                    .OrderBy(s => s.Name);
                return Ok(allSantrals);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, " Error Getting Santrals");
            }
        }

        [HttpPost("AddDeviceType")]
        public IActionResult AddDeviceType(DeviceType newDeviceType)
        {
            try
            {
                Util.PrintOpject(newDeviceType); 
                _database.DeviceTypes.Add(newDeviceType);
                _database.SaveChanges(); 
                return Ok(); 
            } catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, " Error Adding Device");
            }
        }

        [HttpGet("GetDeviceTypes")]
        public IActionResult GetDeviceTypes()
        {
            try
            {
                var allDeviceTypes = _database.DeviceTypes
                    .Include(dt => dt.Devices)
                    .ThenInclude(d => d.Santral)
                    .ToList();
                return Ok(allDeviceTypes);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, " Error Getting Devices");
            }
        }

        [HttpDelete("DeleteDeviceType/{id}")]
        public IActionResult DeleteDeviceType(int id, DeviceType deviceType)
        {
            try
            {
                if (id != deviceType.Id)
                    return BadRequest("Device ID mismatch");

                var deviceTypeToDelete = _database.DeviceTypes.FirstOrDefault(d => d.Id == deviceType.Id);

                if (deviceTypeToDelete == null)
                {
                    return NotFound($"Device with Id = {id} not found");
                }
                else
                {
                    // remove all devices
                    var devices = _database.Devices.Where(d => d.DeviceTypeId == deviceTypeToDelete.Id);
                    _database.Devices.RemoveRange(devices);

                    _database.DeviceTypes.Remove(deviceTypeToDelete);
                    _database.SaveChanges();
                }

                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error deleteing data");
            }
        }

        // =========================================================== Device 

        [HttpPost("AddDevice")]
        public IActionResult AddDevice(Device newDevice)
        {
            try
            {
                Util.PrintOpject(newDevice);

                var oldDevice = _database.Devices.FirstOrDefault(d => d.SerialNum == newDevice.SerialNum); 

                if(oldDevice is Device)
                {
                    return BadRequest("There is device with this id");
                }

                _database.Devices.Add(newDevice);
                _database.SaveChanges();
                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, " Error Adding Device");
            }
        }

        [HttpPost("UpdateDevices")]
        public IActionResult UpdateDevices(List<Device> devices)
        {
            try
            {
                foreach (var device in devices)
                {
                    var oldDevice = _database.Devices.FirstOrDefault(d => d.Id == device.Id);
                    if (oldDevice is Device)
                    {
                        oldDevice.DeviceTypeId = device.DeviceTypeId;
                        oldDevice.SerialNum = device.SerialNum;
                        oldDevice.SantralId = device.SantralId;
                        _database.SaveChanges(); 
                    }
                }
                return Ok();
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, " Error Adding Device");
            }
        }

        [HttpDelete("DeleteDevice/{id}")]
        public IActionResult DeleteDevice(int id, Device device)
        {
            try
            {
                if (id != device.Id)
                    return BadRequest("Device ID mismatch");

                var deviceToDelete = _database.Devices.FirstOrDefault(d => d.Id == device.Id);

                if (deviceToDelete == null)
                {
                    return NotFound($"Device with Id = {id} not found");
                }
                else
                {
                    _database.Devices.Remove(deviceToDelete);
                    _database.SaveChanges();
                }

                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error deleteing data");
            }
        }

        [HttpGet("PrintTest")]
        public IActionResult PrintTest()
        {
            try
            {
                return Ok("Test"); 
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, " Error Getting Santrals");
            }
        }

    }
}