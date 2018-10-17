using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Services
{
    public static class globalvariable
    {

        /// <summary>
        /// Static value protected by access routine.
        /// </summary>
        static int _globalValue = 0;

        /// <summary>
        /// Access routine for global variable.
        /// </summary>
        public static int GlobalValue
        {
            get
            {
                return _globalValue;
            }
            set
            {
                _globalValue = value;
            }
        }
    }
}