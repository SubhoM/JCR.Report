using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using Microsoft.Reporting.WebForms;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class QuestionEPRelation : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public DataSourceResult QuestionEPRelationExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                SearchFormat sf = new SearchFormat();
                sf.CheckInputs(search);

                List<QuestionEpRelation> questionEPExcel = new List<QuestionEpRelation>();
                  DataTable dt = new DataTable();

                  dt = questionEPData(search).Tables[0];

                //convert datatable to list       
                 questionEPExcel = dt.ToList<QuestionEpRelation>();

               
                result = questionEPExcel.ToDataSourceResult(request, tc => new QuestionEpRelation
                {
                    TracerTemplateName = tc.TracerTemplateName,
                    TemplateStatus = tc.TemplateStatus,
                    TracerCustomName = tc.TracerCustomName,
                    TracerStatusName = tc.TracerStatusName,
                    SortOrder = tc.SortOrder,
                    QuestionText = tc.QuestionText,
                    StdEffectiveBeginDate = tc.StdEffectiveBeginDate,
                    EPChangeStatus = tc.EPChangeStatus,
                    ImpactOnQuestion = tc.ImpactOnQuestion,
                    StdEPMappingToQuestion = tc.StdEPMappingToQuestion,
                    EPTextMappingToQuestion = tc.EPTextMappingToQuestion,
                    ComparedStdEP = tc.ComparedStdEP,
                    ComparedEPText = tc.ComparedEPText,
                    EpChangeDescription= tc.EpChangeDescription

                });
              

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = "No Data found matching your criteria.";
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }


                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {

                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "QuestionEPRelation",
                        MethodName = "QuestionEPRelationExcel",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }

            }

            return result;

        }
        public DataSet questionEPData(Search search)
        {
          
            DataSet ds = new DataSet();
         
            try
            {
                var isGlobalAdmin = AppSession.RoleID == (int)Role.GlobalAdmin;
                var spName = isGlobalAdmin ? "ustReport_TracerQuestionWithCriticalDeletedEPGlobalAdmin" : "ustReport_TracerQuestionWithCriticalDeletedEP";

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("CycleID", search.EPMigrationChangeDate == "-1" ? "" : search.EPMigrationChangeDate);
                    cmd.Parameters.AddWithValue("CodeID", search.EPMigrationChangeType == "-1" ? "" : search.EPMigrationChangeType);
                    cmd.Parameters.AddWithValue("StandardGroupID", 1);
                    if (isGlobalAdmin)
                    {
                        
                        cmd.Parameters.AddWithValue("TemplateID", search.TracerListIDs == "-1" ? "" : search.TracerListIDs);
                        cmd.Parameters.AddWithValue("TemplateStatusID", search.TracerStatusIDs == "-1" ? "" : search.TracerStatusIDs);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                        cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs == "-1" ? "" : search.TracerListIDs);
                        cmd.Parameters.AddWithValue("TracerStatusID", search.TracerStatusIDs == "-1" ? "" : search.TracerStatusIDs);
                    }
                    CreateSQLExecuted("spName", cmd);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }


                }
            }
            catch (SqlException)
            {
                throw (new Exception("Limit"));
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            int rowsCount = ds.Tables[0].Rows.Count;

            if (rowsCount == 0)
                throw (new Exception("No Data"));
          //  else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
           //     throw (new Exception("Limit"));
            
            return ds;
        }
    }
}