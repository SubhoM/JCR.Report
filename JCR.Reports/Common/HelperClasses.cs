using JCR.Reports.Models.Enums;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;


namespace JCR.Reports.Common
{
    public static class HelperClasses
    {
        private const int DEFAULT_HOUR = 2;
        private const int DEFAULT_MINUTE = 0;

        public static string GetStandard(string standardLabel, string standardText)
        {
            StringBuilder sb = new StringBuilder();

            //sb.Append("<div class='inlineBlockDisplay'>");
            sb.Append(standardLabel);
            sb.Append(": ");
            sb.Append(standardText);
            //sb.Append("</div>");

            return sb.ToString();
        }

        public static List<string> GetMonthsList(DateTime? startDate, DateTime? endDate)
        {
            if (!endDate.HasValue)
                endDate = DateTime.Now;

            if (!startDate.HasValue)
                startDate = DateTime.Now.AddYears(-1);

            var list = Enumerable.Range(0, (endDate.Value.Year - startDate.Value.Year) * 12 + (endDate.Value.Month - startDate.Value.Month + 1))
                     .Select(m => new DateTime(startDate.Value.Year, startDate.Value.Month, 1).AddMonths(m).ToString("MMM-yyyy")).ToList();

            list.Insert(0, "Total");
            return list;
        }

        /// <summary>
        /// Sets the label forecolor based on the program
        /// </summary>
        /// <param name="programID"></param>
        /// <returns></returns>
        //public static string GetHexColorForProgramName(int programID)
        //{
        //    string foregroundColor = "";

        //    switch (programID)
        //    {
        //        case (int)WebConstants.ProgramType.NursingCareCenter:
        //            foregroundColor = "#4f9d97";
        //            break;

        //        case (int)WebConstants.ProgramType.BehavioralHealth:
        //            foregroundColor = "#cd392f";
        //            break;

        //        case (int)WebConstants.ProgramType.Laboratory:
        //            foregroundColor = "#e87a3f";
        //            break;

        //        case (int)WebConstants.ProgramType.HomeCare:
        //            foregroundColor = "#5dccaa";
        //            break;

        //        case (int)WebConstants.ProgramType.Ambulatory:
        //            foregroundColor = "#92183a";
        //            break;

        //        case (int)WebConstants.ProgramType.OfficeBasedSurgery:
        //            foregroundColor = "#3a4f23";
        //            break;

        //        case (int)WebConstants.ProgramType.CriticalAccessHospitals:
        //            foregroundColor = "#1d754d";
        //            break;

        //        default:
        //            foregroundColor = "#1e3287";
        //            break;
        //    }
        //    return foregroundColor;
        //}

        public static DateTime? CalculateNextRunDate(int scheduleType, string daysOfWeek = null, int? dayOfMonth = null, int? dayOfQuarter = null, DateTime? startingFromDate = null)
        {
            // if once, return the date
            if (scheduleType == (int)ScheduleType.None)
            {
                return null;
            }

            // set the start or seed date, if set, otherwise use right now
            DateTime dtNextRunDate = startingFromDate == null ? DateTime.Now : startingFromDate.Value;
            DateTime dtStart = dtNextRunDate;

            if (scheduleType == (int)ScheduleType.Monthly)
            {
                if (dayOfMonth != null && dayOfMonth.HasValue)
                {
                    int month = dtNextRunDate.Month;
                    // if already past the day, use next month
                    if (dtNextRunDate.Day > dayOfMonth)
                    {
                        // Bump to the next month which could roll into the next year
                        dtNextRunDate = dtNextRunDate.AddMonths(1);
                        month = dtNextRunDate.Month;
                    }
                    // if the user selected day is past the possible num days in the month, use last day of month
                    if (dayOfMonth.Value > DateTime.DaysInMonth(dtNextRunDate.Year, month))
                    {
                        dayOfMonth = DateTime.DaysInMonth(dtNextRunDate.Year, month);
                    }
                    // new date
                    dtNextRunDate = new DateTime(dtNextRunDate.Year, month, dayOfMonth.Value);
                }
            }
            // if Weekly
            else if (scheduleType == (int)ScheduleType.Weekly)
            {
                char[] sep = { ',' };
                string[] daysOfWeekList = daysOfWeek.Split(sep, StringSplitOptions.RemoveEmptyEntries);

                // check the next 7 days maximum
                for (int d = 0; d <= 7; d++)
                {
                    dtNextRunDate = dtStart.AddDays(d);
                    string dayOfWeekString = ((int)dtNextRunDate.DayOfWeek).ToString();

                    if (daysOfWeekList.Contains(dayOfWeekString))
                    {
                        break;
                    }
                } // next day
            }
            else if (scheduleType == (int)ScheduleType.Quarterly)
            {
                int year = DateTime.Today.Year;
                int quarterNumber = (DateTime.Today.Month - 1) / 3 + 2;
                DateTime datetime = DateTime.Now;
                int currQuarter = (datetime.Month - 1) / 3 + 1;
                DateTime dtFirstDay = new DateTime(datetime.Year, 3 * currQuarter - 2, 1);
                int dtEndDay= (dtFirstDay.AddMonths(3).AddDays(-1)).Day;
                var todayValue = ((DateTime.Now.Date-dtFirstDay.Date).Days)+1;
                
                if (quarterNumber == 5)
                {
                    quarterNumber = 1;
                    year = year + 1;
                }
                dtNextRunDate = new DateTime(year, (quarterNumber - 1) * 3 + 1, 1);
                if (dayOfQuarter >= 91)
                {
                    DateTime firstDayOfQuarter = new DateTime(year, (quarterNumber - 1) * 3 + 1, 1);
                    DateTime lastDayOfQuarter = firstDayOfQuarter.AddMonths(3).AddDays(-1);
                    dtNextRunDate = lastDayOfQuarter;
                }
                else
                {
                    if (todayValue == dayOfQuarter)
                    {
                        dtNextRunDate = dtStart;
                    }
                    else if(dayOfQuarter>todayValue)
                    {
                        int daysToAdd = Convert.ToInt16(dayOfQuarter) - todayValue;
                        dtNextRunDate = DateTime.Today.AddDays(daysToAdd);
                    }
                    else
                    {
                        dtNextRunDate = dtNextRunDate.AddDays(Convert.ToInt32(dayOfQuarter - 1));
                    }
                }
            }

            int defaultHour = ConfigurationManager.AppSettings["DefaultHour"] != null ? int.Parse(ConfigurationManager.AppSettings["DefaultHour"]) : DEFAULT_HOUR;
            int defaultMinute = ConfigurationManager.AppSettings["DefaultMinute"] != null ? int.Parse(ConfigurationManager.AppSettings["DefaultMinute"]) : DEFAULT_MINUTE;

            return new DateTime(dtNextRunDate.Year, dtNextRunDate.Month, dtNextRunDate.Day, defaultHour, defaultMinute, 0);
        }

        public static void SetReportOrScheduleID(int id, int reportID)
        {
            if (id > 0)
            {
                if (Enum.IsDefined(typeof(ReportsListEnum), id))
                    AppSession.ReportID = id;
                else
                    AppSession.ReportScheduleID = id;
            }
            if (AppSession.ReportID <= 0)
                AppSession.ReportID = reportID;
        }

        /// <summary>
        /// Checks if the Save to My Reports button should be displayed or hidden
        /// M.Orlando 09/27/2017: Updated for TEN
        /// </summary>
        /// <param name="roleID"></param>
        /// <param name="reportOwner"></param>
        /// <param name="loggedInUser"></param>
        /// <param name="actionType"></param>
        /// <returns></returns>
        public static bool HideSaveToMyReports(int? roleID, int? reportOwner, int? loggedInUser, int? actionType) {

            bool isAdmin = false;

            switch (roleID) {
                case (int) WebConstants.Role.ProgramAdministrator:
                    isAdmin = true;
                    break;
                case (int) WebConstants.Role.MockSurveyUser:
                    isAdmin = true;
                    break;
                case (int) WebConstants.Role.MockSurveyReviewer:
                    isAdmin = true;
                    break;
            }
            return (isAdmin == false && reportOwner != loggedInUser && actionType != (int)WebConstants.ActionType.Copy);
        }        
    }
}
