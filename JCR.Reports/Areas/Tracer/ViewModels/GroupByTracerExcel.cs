using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;


namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class GroupByTracerExcel
    {
        private List<GroupByTracerAssignmentData> _monthwiseTracer = new List<GroupByTracerAssignmentData>();

        public List<GroupByTracerAssignmentData> MonthwiseTracer
        {
            get { return _monthwiseTracer; }
            set { _monthwiseTracer = value; }
        }

        [Display(Name="Tracer")]
        public string TracerName { get; set; }

        [Display(Name = "Person(s) Responsible")]
        public string ResponsiblePersonName { get; set; }

        [Display(Name ="Planned Observation Count")]
        public int ObjservationCount { get; set; }

         
        public DataTable aggregateData { get; set; }

        public  List<DateTime> weekStartDates = new List<DateTime>();

        public  List<DateTime> weekEndDates = new List<DateTime>();
        public  List<string> weekInformation = new List<string>();
    }
}