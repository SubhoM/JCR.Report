using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace JCR.Reports.Common
{
    public static class ExtensionUtility
    {
        public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            HashSet<TKey> seenKeys = new HashSet<TKey>();
            foreach (TSource element in source)
            {
                if (seenKeys.Add(keySelector(element)))
                {
                    yield return element;
                }
            }
        }

        /*Converts List To DataTable*/
        public static DataTable ToDataTable<TSource>(this IList<TSource> data)
        {
            DataTable dataTable = new DataTable(typeof(TSource).Name);
            PropertyInfo[] props = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in props)
            {
                dataTable.Columns.Add(prop.Name, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType);
            }

            foreach (TSource item in data)
            {
                var values = new object[props.Length];
                for (int i = 0; i < props.Length; i++)
                {
                    values[i] = props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            return dataTable;
        }

        /*Converts DataTable To List*/
        public static List<TSource> ToList<TSource>(this DataTable dataTable) where TSource : new()
        {
            var dataList = new List<TSource>();

            const BindingFlags flags = BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic;
            var objFieldNames = (from PropertyInfo aProp in typeof(TSource).GetProperties(flags)
                                    select new { Name = aProp.Name, Type = Nullable.GetUnderlyingType(aProp.PropertyType) ?? aProp.PropertyType }).ToList();
            var dataTblFieldNames = (from DataColumn aHeader in dataTable.Columns
                                        select new { Name = aHeader.ColumnName, Type = aHeader.DataType }).ToList();
            var commonFields = objFieldNames.Intersect(dataTblFieldNames).ToList();

            foreach (DataRow dataRow in dataTable.AsEnumerable().ToList())
            {
                var aTSource = new TSource();
                foreach (var aField in commonFields)
                {
                    PropertyInfo propertyInfos = aTSource.GetType().GetProperty(aField.Name);
                    var value = (dataRow[aField.Name] == DBNull.Value) ? null : dataRow[aField.Name]; //if database field is nullable
                    propertyInfos.SetValue(aTSource, value, null);
                }
                dataList.Add(aTSource);
            }
            return dataList;
        }

     

        public static int ToInt(this string input)
        {
            int returnVal = 0;

            if(!string.IsNullOrEmpty(input))
                int.TryParse(input, out returnVal);

            return returnVal;
        }

        public static bool In<T>(this T @object, params T[] values)
        {
            // this is LINQ expression. If you don't want to use LINQ,
            // you can use a simple foreach and return true 
            // if object is found in the array
            return values.Contains(@object);
        }

        public static bool IsStringNull(this string input)
        {
            return string.IsNullOrEmpty(input);
        }

        public static string ReplaceNewline(this string input)
        {
            if (input.IsStringNull())
                return string.Empty;
            else
                return input.Replace(WebConstants.NEWLINE_ONE, WebConstants.EMPTY_STRING).Replace(WebConstants.NEWLINE_TWO, WebConstants.EMPTY_STRING);
            //return Regex.Replace(input, @"[^\x20-\x7F]", " ");
            
        }

        public static string ReplaceSpecialCharacters(this string input)
        {
            if (input.IsStringNull())
                return string.Empty;
            else
            {
                var replacementPair = new Dictionary<string, string> {
                { WebConstants.NEWLINE_ONE, WebConstants.EMPTY_STRING},
                {WebConstants.NEWLINE_TWO, WebConstants.EMPTY_STRING},
                {WebConstants.BREAKTAG, WebConstants.EMPTY_STRING},
                {WebConstants.BREAKENDTAG, WebConstants.EMPTY_STRING},
                {WebConstants.AMPERSAND, WebConstants.AMPER_SAND},
                };
                return Regex.Replace(input, string.Join("|", replacementPair.Keys
                .Select(k => k.ToString()).ToArray()), m => replacementPair[m.Value]);
            }
           
        }


        public static string CreateCSVFile(this DataTable dt)
        {
            StringBuilder sb = new StringBuilder();

            int columnCount = dt.Columns.Count;
            for (int i = 0; i < columnCount; i++)
            {
                sb.Append(dt.Columns[i]);
                if (i < columnCount - 1)
                {
                    sb.Append(",");
                }
            }
            sb.Append(Environment.NewLine);

            foreach (DataRow dr in dt.Rows)
            {
                for (int i = 0; i < columnCount; i++)
                {
                    if (!Convert.IsDBNull(dr[i]))
                    {
                        sb.Append(dr[i].ToString().ReplaceNewline().CSVEscape());
                    }
                    if (i < columnCount - 1)
                    {
                        sb.Append(",");
                    }
                }
                sb.Append(Environment.NewLine);
            }
            return sb.ToString();
        }


        public static string CSVEscape(this string s)
        {
            if (s.Contains(WebConstants.QUOTE))
                s = s.Replace(WebConstants.QUOTE, WebConstants.ESCAPED_QUOTE);

            if (s.IndexOfAny(WebConstants.CHARACTERS_THAT_MUST_BE_QUOTED) > -1)
                s = WebConstants.QUOTE + s + WebConstants.QUOTE;

            return s;
        }


       

        
    }
}
