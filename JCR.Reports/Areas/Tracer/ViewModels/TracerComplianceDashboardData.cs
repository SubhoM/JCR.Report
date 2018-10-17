using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class TracerComplianceDashboardData
    {
        private List<TracerComplianceDepartmentInfo> _departmentwiseTracer = new List<TracerComplianceDepartmentInfo>();

        public List<TracerComplianceDepartmentInfo> DepartmentwiseTracer
        {
            get { return _departmentwiseTracer; }
            set { _departmentwiseTracer = value; }
        }
        public string TracerCustomName { get; set; }
        public int TracerCustomID { get; set; }
        public int OverallTotalCompletedObservation { get; set; }
        public string OverallTracerCompliance { get; set; }
        public decimal OverallNum { get; set; }
        public decimal OverallDen { get; set; }
        public string OutputDepartmentIds { get; set; }
    }
}