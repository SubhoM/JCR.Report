using System;
using System.Linq;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Models;
using System.Configuration;
namespace JCR.Reports.Services
{
    public class ExceptionService : BaseService
    {
        public int LogException(ExceptionLog exceptionLog)
        {
            int rowID = -1;

            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand("uspExceptionLogInsert", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ExceptionText", exceptionLog.ExceptionText);
                    cmd.Parameters.AddWithValue("@PageName", exceptionLog.PageName == null ? "" : exceptionLog.PageName);
                    cmd.Parameters.AddWithValue("@MethodName", exceptionLog.MethodName == null ? "" : exceptionLog.MethodName);
                    cmd.Parameters.AddWithValue("@UserID", exceptionLog.UserID);
                    cmd.Parameters.AddWithValue("@SiteId", exceptionLog.SiteId);
                    object val = DBNull.Value;
                    if (!String.IsNullOrEmpty(exceptionLog.TransSQL))
                    {
                        val = exceptionLog.TransSQL;
                    }
                    cmd.Parameters.AddWithValue("@TransSQL", val);
                    val = DBNull.Value;
                    if (!String.IsNullOrEmpty(exceptionLog.HttpReferrer))
                    {
                        val = exceptionLog.HttpReferrer;
                    }
                    cmd.Parameters.AddWithValue("@HttpReferrer", val);
                    cmd.Parameters.Add("@ExceptionLogID", SqlDbType.Int);
                    cmd.Parameters["@ExceptionLogID"].Direction = ParameterDirection.Output;

                    CreateSQLExecuted("uspExceptionLogInsert", cmd);
#if DEBUG
    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    cmd.ExecuteNonQuery();
                    rowID = Convert.ToInt32(cmd.Parameters["@ExceptionLogID"].Value);
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return rowID;
        }
    }
}
