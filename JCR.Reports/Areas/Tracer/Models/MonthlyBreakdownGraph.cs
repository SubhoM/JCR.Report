using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using JCR.Reports.Common;

namespace JCR.Reports.Areas.Tracer.Models
{
    public class MonthlyBreakdownGraph
    {
        public string Month { get; set; }
        public int Observations { get; set; }

        public string Label
        {
            get
            {
                var returnVal = string.Format("{0}%{1}({2}/{3})", Compliance.ToString(), Environment.NewLine, TotalNum.ToString(), TotalDen.ToString());
                if (Observations < 1)
                    returnVal = "No data";
                else if (TotalDen < 1)
                    returnVal = "N/A";

                return returnVal;
            }
        }

        public string Tooltip
        {
            get
            {
                if(AppSession.ReportID == 13)   
                    return string.Format("Total Completed Observations: {0}<br/> Total Numerator: {1}<br/> Total Denominator: {2}", Observations.ToString(), TotalNum.ToString(), TotalDen.ToString());
                else
                    return string.Format("Total Numerator: {0}<br/> Total Denominator: {1}", TotalNum.ToString(), TotalDen.ToString());
            }
        }

        public int TotalNum { get; set; }
        public int TotalDen { get; set; }
        public decimal Compliance 
        {
            get
            {
                var val = 0.0f;
                if (TotalDen != 0)
                {
                    val = (float)TotalNum / (float)TotalDen;
                }

                return Math.Round((decimal)val * 100, 1);
            }
        }
    }
}