using System;
using System.Data.SqlClient;
using System.Data;
using System.Configuration;
using JCR.Reports.Common;

namespace JCR.Reports.Services
{
    public class ActionTracking
    {

        public void LogActionTaken(int ActionTypeID)
        {

          
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))

                {

                    var cmd = new SqlCommand("ustLogTracerActionSummaryByMonth", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("@SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("@ActionTaken", ActionTypeID);
                    cmd.Parameters.AddWithValue("@UserID", AppSession.UserID);

                    cn.Open();
                    cmd.ExecuteScalar();
                }
                LogActionTakenDetail(ActionTypeID);
           
        }
        public void LogActionTakenDetail(int ActionTypeID)
        {

           
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
                {
                int EProductID = 2;
                if (ActionTypeID >= 47)
                    EProductID = 1;

                var cmd = new SqlCommand("ustAppEventLogDetail", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("@SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("@ActionTaken", ActionTypeID);
                    cmd.Parameters.AddWithValue("@UserID", AppSession.UserID);
                    cmd.Parameters.AddWithValue("@EProductID", EProductID);
                    cn.Open();
                    cmd.ExecuteScalar();
                
                }
          

        }
    }
}