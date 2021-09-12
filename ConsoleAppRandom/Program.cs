using ConsoleApp.Data;
using System.Linq;
using MailKit.Net.Smtp;
using MimeKit;
using ConsoleApp.Model;
using ConsoleApp.Utils;
using System.Collections.Generic;
using System;
using System.Threading;

namespace ConsoleApp
{
    class Program
    {
        public static string[] brokenList = new string[] { 
            "No Signal received from device", 
            "The battery is empty", 
            "Sensor Data are out of range", 
            "The data recived is not consistent", 
            "Connection is too weak", 
            "Sensor X in device does not work correctly" 
        };

        public static string[] activeList = new string[] {
            "Device is working correctly"
        };

        public static string[] passiveList = new string[] {
            "Device is not used yet",
            "Device is being repaired"
        };

        static void Main(string[] args)
        {   
            using (var context = new AppDBContext())
            {
                var count = 0;
                Random r = new Random();
                while (count < 11)
                {
                    var devices = context.Devices.ToList();
                    Util.PrintOpject(devices);
                    foreach (var device in devices)
                    {
                        int rInt = r.Next(1, 4);
                        switch (rInt)
                        {
                            case 1: // Active 
                                device.State = Device.ACTIVESTATE;
                                device.Message = activeList[0];
                                break;
                            case 2: // Passive 
                                int rInt2 = r.Next(0, 2);
                                device.State = Device.PASSIVESTATE;
                                device.Message = passiveList[rInt2];
                                break;
                            case 3: // Broken
                                int rInt3 = r.Next(0, 6);
                                device.State = Device.BROKENSTATE;
                                device.Message = brokenList[rInt3];
                                break;
                            default:
                                break;
                        }
                    }
                    context.SaveChanges();
                    Thread.Sleep(4999);
                    count++; 
                }
            }
        }
    }
}