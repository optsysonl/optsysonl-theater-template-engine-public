
function querySt(ji)
{

    hu = window.location.search.substring(1);
    gy = hu.split("&");
    for (i=0;i<gy.length;i++) {
        ft = gy[i].split("=");

        if (ft[0] == ji) {
            return ft[1];
        }

    }

}

function setCookie(c_name,value,expireMins)
{
    var exdate=new Date();
    exdate.setMinutes(exdate.getMinutes()+expireMins);
    document.cookie=c_name+ "=" +escape(value)+
        ((expireMins==null) ? "" : ";expires="+exdate.toUTCString());
}

function getCookie(c_name)
{
    if (document.cookie.length>0)
    {
        var c_start=document.cookie.indexOf(c_name + "=");
        if (c_start!=-1)
        {
            c_start=c_start + c_name.length+1;
            var c_end=document.cookie.indexOf(";",c_start);
            if (c_end==-1) c_end=document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
}

//Initialize our user agent string to lower case.
var uagent = navigator.userAgent.toLowerCase();

//**************************
// Detects if the current device is a smart phone
function DetectSmart()
{
    if (uagent.search("iphone") > -1)
        return true;
    else if (uagent.search("opera 2") > -1)
        return true;
    else if (uagent.search("iphone")>-1)
        return true;
    else if (uagent.search("ipod")>-1)
        return true;
    else if (uagent.search("palm")>-1)
        return true;
    else if (uagent.search("palm os")>-1)
        return true;
    else if (uagent.search("hiptop")>-1)
        return true;
    else if (uagent.search("avantgo")>-1)
        return true;
    else if (uagent.search("fennec")>-1)
        return true;
    else if (uagent.search("plucker")>-1)
        return true;
    else if (uagent.search("blazer")>-1)
        return true;
    else if (uagent.search("xiino")>-1)
        return true;
    else if (uagent.search("elaine")>-1)
        return true;
    else if (uagent.search("palmos")>-1)
        return true;
    else if ((uagent.search("android")>-1) && (uagent.search("mobile")>-1))
        return true;
    else if (uagent.search("mot-cool")>-1)
        return true;
    else if (uagent.search("IEMobile")>-1)
        return true;
    else if (uagent.search("windows phone")>-1)
        return true;
    else if (uagent.search("AppleWebKit")>-1)
        return true;
    else if (uagent.search("Mobile Safari")>-1)
        return true;
    else if (uagent.search("BlackBerry")>-1)
        return true;
    else if (uagent.search("teleca")>-1)
        return true;
    else if (uagent.search("samsung-sgh-A737")>-1)
        return true;
    else
        return false;
}

if (querySt("mobile") == "false") {
    setCookie("mobile","False","5");
}

if (DetectSmart() == true){
    if (getCookie("mobile") != "False"){
        window.location = "http://cinemacafe.wwmm.mobi/";
    }

}