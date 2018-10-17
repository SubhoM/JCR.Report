using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class ApplicationEvent
    {
        public int SiteId { get; set; }
        public int EproductId { get; set; }
        public int ProgramId { get; set; }
        public int UserId { get; set; }
        public int ActionTypeId { get; set; }
    }
}