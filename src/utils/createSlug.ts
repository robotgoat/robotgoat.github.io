// Helper function to create clean slugs for the url

export default function(postid: string) {
    const postArr: string[] = postid.split("/");
    const urlBase: string = postArr[postArr.length-1];
    const urlBaseParts: string[] = urlBase.split("_");

    const slugDate: string = urlBaseParts[0].replaceAll("-", "/");
    const slugName: string = urlBaseParts[1];
    const finalSlug: string = slugDate + "/" + slugName;
    
    return finalSlug;
}