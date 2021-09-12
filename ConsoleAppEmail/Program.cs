using ConsoleApp.Data;
using System.Linq;
using MailKit.Net.Smtp;
using MimeKit;
using ConsoleApp.Model;
using ConsoleApp.Utils;

namespace ConsoleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            using (var context = new AppDBContext())
            {

                /*
                    Select d.Id, d.Name, ISNULL(d.Count - SUM(s.Count), d.Count) as 'available' from
                    Devices as d left join SantralDevices as s on d.Id = s.DeviceId
                    group by d.Id, d.Name, d.Count
                */

                var query =
                    from d in context.Devices
                    join
                    s in context.SantralDevices
                    on d.Id equals s.DeviceId
                    into joinedTable
                    from row in joinedTable.DefaultIfEmpty() // we add this line to make left join 
                    group new // this is the new table we are going to work with 
                    {
                        DeviceId = d.Id,
                        DeviceName = d.Name, 
                        DeviceCount = d.Count, 
                        DeviceUsedCount = row == null? 0 : row.Count
                    }
                    by new // this is the columns we use to gourp the table 
                    {
                        d.Id, 
                        d.Name, 
                        d.Count // this works becuase the counts all are the same so gourping by them is fine 
                    }
                    into newGourp // this is the new table after the gourping is done 
                    select new
                    {
                        DeviceId = newGourp.Key.Id, // this how we access keys 
                        DeviceName = newGourp.Key.Name, 
                        AvailabelDevices = newGourp.Key.Count - newGourp.Sum(d => d.DeviceUsedCount) // columns other then keys can't be accessed directly. 
                    }; 

                Util.PrintOpject(query); // this a cool way to see the contents of one object without knowing what properties this object has. 

                foreach (var device in query)
                {
                    if(device.AvailabelDevices < 5)
                    {
                        SendEmail(device.DeviceName, device.AvailabelDevices);
                    }
                }
            }
        }

        private static void SendEmail(string deviceName, int remainingCount)
        {
            MimeMessage message = new();

            MailboxAddress from = new("Sender", Credentials.Email);
            message.From.Add(from);

            MailboxAddress to = new("Reciever", "homebooktester@gmail.com");
            message.To.Add(to);

            message.Subject = "Worning: Device Count has decreased";

            BodyBuilder bodyBuilder = new();
            bodyBuilder.TextBody = $"The number of available pieces of the device *{deviceName}* has been declined to {remainingCount}";

            message.Body = bodyBuilder.ToMessageBody();

            SmtpClient client = new SmtpClient();
            client.Connect("smtp.gmail.com", 465, true);
            client.Authenticate(Credentials.Email, Credentials.password);

            client.Send(message);

            client.Disconnect(true);
            client.Dispose();
        }
    }
}
