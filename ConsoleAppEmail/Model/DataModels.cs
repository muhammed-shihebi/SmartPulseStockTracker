using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ConsoleApp.Model
{
    public class Device
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public int Count { get; set; }
        public ICollection<SantralDevice> SantralDevices { get; set; }
    }

    public class Santral
    {
        [Key]
        public int Id { set; get; }
        public string Name { set; get; }
        public string Eic { set; get; }
        public int OrganizationId { set; get; }
        public Organization Organization { get; set; }
        public ICollection<SantralDevice> SantralDevices { get; set; }
    }

    public class SantralDevice
    {
        [Key]
        [Column(Order = 0)]
        [ForeignKey("Santral")]
        public int SantralId { set; get; }
        [Key]
        [Column(Order = 1)]
        [ForeignKey("Device")]
        public int DeviceId { set; get; }
        public int Count { get; set; }
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
