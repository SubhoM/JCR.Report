using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbyProgramData : ERTracersResponseSummary
    {

        public int ProgramID { get; set; }

        [Display(Name = "Program")]
        public string ProgramName { get; set; }
        public string ProgramCode { get; set; }


    }
}