using System.Text;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace JCR.Reports.Services
{
    /// <summary>
    /// BaseService
    /// Common functionality used for database access
    /// </summary>
    public class BaseService
    {
        public string ConnectionString { get; set; }
        public string ConnectionString_WHSE { get; set; }
        protected const string TSQL = "TSQL";
        protected string _SQLExecuted;

        /// <summary>
        /// Constructor
        /// Sets up connection string
        /// </summary>
        public BaseService()
        {
            this.ConnectionString = ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString();
          
        }

        public BaseService(string connectionString)
        {
            this.ConnectionString = connectionString;
        }

        /// <summary>
        /// Gets data passed to a stored procedure for use in debugging and errors
        /// </summary>
        /// <param name="spName">Stored Procedure or Command Name</param>
        /// <param name="cmd">Command object to get parameter values</param>
        protected void CreateSQLExecuted(string spName, SqlCommand cmd = null)
        {
            _SQLExecuted = string.Empty;

            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("EXEC dbo.{0} ", spName);

            if (cmd != null && cmd.Parameters != null && cmd.Parameters.Count > 0) {
                foreach (SqlParameter sqlParm in cmd.Parameters) {
                    if (sqlParm.SqlValue == null) {
                        sb.AppendFormat("@{0}=NULL, ", sqlParm.ParameterName);
                    } else {
                        switch (sqlParm.SqlDbType) {
                            case SqlDbType.BigInt:
                                break;
                            case SqlDbType.Binary:
                                break;
                            case SqlDbType.Bit:
                                sb.AppendFormat("@{0}={1}, ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.Char:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.Date:
                                break;
                            case SqlDbType.DateTime:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.DateTime2:
                                break;
                            case SqlDbType.DateTimeOffset:
                                break;
                            case SqlDbType.Decimal:
                                break;
                            case SqlDbType.Float:
                                break;
                            case SqlDbType.Image:
                                break;
                            case SqlDbType.Int:
                                sb.AppendFormat("@{0}={1}, ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.Money:
                                break;
                            case SqlDbType.NChar:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.NText:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.NVarChar:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.Real:
                                break;
                            case SqlDbType.SmallDateTime:
                                break;
                            case SqlDbType.SmallInt:
                                break;
                            case SqlDbType.SmallMoney:
                                break;
                            case SqlDbType.Structured:
                                break;
                            case SqlDbType.Text:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.Time:
                                break;
                            case SqlDbType.Timestamp:
                                break;
                            case SqlDbType.TinyInt:
                                break;
                            case SqlDbType.Udt:
                                break;
                            case SqlDbType.UniqueIdentifier:
                                break;
                            case SqlDbType.VarBinary:
                                break;
                            case SqlDbType.VarChar:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                            case SqlDbType.Variant:
                                break;
                            case SqlDbType.Xml:
                                sb.AppendFormat("@{0}='{1}', ", sqlParm.ParameterName, sqlParm.SqlValue.ToString());
                                break;
                        }
                    }
                }
                string transSQL = string.Empty;
                if (sb.Length > 0 && cmd.Parameters.Count > 0) {
                    transSQL = sb.ToString().Substring(0, sb.Length - 2);
                } else {
                    transSQL = sb.ToString();
                }
                _SQLExecuted = transSQL;
            }
        }
    }
}