<?php

namespace App\Api;

use App\Core\Cache;

class CacheController extends Api
{
    public $api_key;

    public function __construct(array $parameters)
    {
        $this->api_key = $parameters['api_key'];

        parent::__construct($parameters);
    }

    public function clear()
    {
        echo    '
                <div class="clear-cache-status">
                    <div class="status-title" id="status-title">Clearing Cache</div>
                    <div id="status-text" class="status-text hidden">The system is still working! (last updated on <span id="status-time"></span>)</div>
                    
                    <div class="loader" id="loader"><div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
                    <div class="message hidden" id="message"></div>
                </div>
                <style>
                    body {background: rgba(0,0,0,0.2);}
                    .message {-webkit-transition: 0.2s;-moz-transition: 0.2s;transition: 0.2s;font-size: 16px; color: #2b2b2b; font-family: sans-serif;position: absolute;top: 50%;left: 50%;transform: translate(-50%,-50%);}
                    .loader {-webkit-transition: 0.2s;-moz-transition: 0.2s;transition: 0.2s;}
                    .hidden {opacity: 0;visibility: hidden;}
                    .clear-cache-status {width: 400px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%); box-shadow: 5px 5px 10px rgba(0, 0, 0,0.2);padding: 20px;text-align: center;background: #fff;}
                    .status-title {margin-bottom: 10px;font-size: 16px; color: #2b2b2b; font-family: sans-serif;}
                    .status-text { font-family: sans-serif;color: #2b2b2b;}
                    .lds-default {display: inline-block;position: relative;width: 80px;height: 80px;}
                    .lds-default div {position: absolute;width: 6px;height: 6px;background: #2b2b2b;border-radius: 50%;animation: lds-default 1.2s linear infinite;}
                    .lds-default div:nth-child(1) {animation-delay: 0s;top: 37px;left: 66px;}
                    .lds-default div:nth-child(2) {animation-delay: -0.1s;top: 22px;left: 62px;}
                    .lds-default div:nth-child(3) {animation-delay: -0.2s;top: 11px;left: 52px;}
                    .lds-default div:nth-child(4) {animation-delay: -0.3s;top: 7px;left: 37px;}
                    .lds-default div:nth-child(5) {animation-delay: -0.4s;top: 11px;left: 22px;}
                    .lds-default div:nth-child(6) {animation-delay: -0.5s;top: 22px;left: 11px;}
                    .lds-default div:nth-child(7) {animation-delay: -0.6s;top: 37px;left: 7px;}
                    .lds-default div:nth-child(8) {animation-delay: -0.7s;top: 52px;left: 11px;}
                    .lds-default div:nth-child(9) {animation-delay: -0.8s;top: 62px;left: 22px;}
                    .lds-default div:nth-child(10) {animation-delay: -0.9s;top: 66px;left: 37px;}
                    .lds-default div:nth-child(11) {animation-delay: -1s;top: 62px;left: 52px;}
                    .lds-default div:nth-child(12) {animation-delay: -1.1s;top: 52px;left: 62px;}
                    @keyframes lds-default {
                      0%, 20%, 80%, 100% {transform: scale(1);}
                      50% {transform: scale(1.5);}}
                </style>
                ';

        echo    '<script> 
                    var time_block = document.getElementById("status-time");
                    var text_block = document.getElementById("status-text");
                    var title_block = document.getElementById("status-title");
                    var loader_block = document.getElementById("loader");
                    var message = document.getElementById("message");
                    clearCache();
                    function clearCache(){
                        var http = new XMLHttpRequest();
                        http.open("GET", "/api/cache/clearm/'.$this->api_key.'", true);                   
                        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");     
                        http.onreadystatechange = function() {  
                            
                            if(http.readyState == 4){
                                switch(http.status){
                                    case 200:                                       
                                        title_block.classList.add("hidden");
                                        loader_block.classList.add("hidden");                                        
                                        message.classList.remove("hidden");
                                        message.innerHTML = http.responseText;
                                        break;
                                    case 500:
                                        var t = new Date();   
                                        text_block.classList.remove("hidden");
                                        var m = (t.getMinutes() < 10) ? "0"+t.getMinutes() : t.getMinutes();
                                        var s = (t.getSeconds() < 10) ? "0"+t.getSeconds() : t.getSeconds(); 
                                        time_block.innerHTML = t.getHours()+":"+m+":"+s;
                                        clearCache();
                                        break;
                                }
                            }
                        }
                        http.send();
                    };
                </script>';

    }

    public function clearm()
    {
        Cache::clear();

        echo 'Cache was cleared!';

    }

}