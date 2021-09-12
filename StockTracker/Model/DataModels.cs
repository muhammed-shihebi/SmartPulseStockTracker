using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace StockTracker.Model
{

    public class DeviceType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public ICollection<Device> Devices { get; set; }
    }

    public class Device
    {
        public static readonly int ACTIVESTATE = 1; 
        public static readonly int PASSIVESTATE = 2; 
        public static readonly int BROKENSTATE = 3;

        public static readonly string INITMESSAGE = "Device not used yet"; 

        [Key]
        public int Id { get; set; }
        public string SerialNum { get; set; }
        public int DeviceTypeId { get; set; }
        public int State { get; set; } = PASSIVESTATE;
        public string Message { get; set; } = INITMESSAGE; 

        [ForeignKey("DeviceTypeId")]
        public DeviceType DeviceType { get; set;}

        // this way a device can exist without without a santral
        public int? SantralId { get; set; }

        [ForeignKey("SantralId")]
        public Santral Santral { get; set; }
    }

    public class Santral
    {
        [Key]
        public int Id { set; get; }
        public string Name { set; get; }
        public string Eic { set; get; }
        public int OrganizationId { set; get; }
        public ICollection<Device> Devices { get; set; }
        public Organization Organization { get; set; }
    }

    public class Organization
    {
        [Key]
        public int Id { get; set; }
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public string OrganizationStatus { get; set; }
        public string OrganizationETSOCode { get; set; }
        public string OrganizationShortName { get; set; }
        public ICollection<Santral> Santrals { get; set; }
    }
}
