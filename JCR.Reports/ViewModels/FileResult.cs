using Newtonsoft.Json;



namespace JCR.Reports.ViewModels
{
    public class FileResult
    {

        [JsonProperty("FileStream")]
        public byte[] FileStream { get; set; }
        [JsonProperty("FileName")]
        public string FileName { get; set; }
        [JsonProperty("FileID")]
        public string FileID { get; set; }
        [JsonProperty("FileSize")]
        public long FileSize { get; set; }
        [JsonProperty("CreateDate")]
        public string CreateDate { get; set; }
    }
}