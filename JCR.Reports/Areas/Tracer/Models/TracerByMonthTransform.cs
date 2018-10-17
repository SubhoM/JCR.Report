using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class TracerByMonthTransform
    {
        public int ID { get; set; }
        public string Title { get; set; }
        public string MonthYear { get; set; }
        public int Observations { get; set; }
        public int NUM { get; set; }
        public int DEN { get; set; }
    }
}