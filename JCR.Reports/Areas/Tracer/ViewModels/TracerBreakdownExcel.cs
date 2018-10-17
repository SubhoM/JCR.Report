using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class TracerBreakdownExcel
    {
        private List<MonthwiseTracerInfo> _monthwiseTracer = new List<MonthwiseTracerInfo>();

        public List<MonthwiseTracerInfo> MonthwiseTracer
        {
            get { return _monthwiseTracer; }
            set { _monthwiseTracer = value; }
        }

        [Display(Name="Tracer")]
        public string TracerName { get; set; }

        public int ID { get; set; }

    }
}