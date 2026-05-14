<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <style  type="text/css">
        .button {
            background-color: #10228B;
            border: none;
            color: white !important;
            padding: 5px 25px;
            width: 250px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 15px;
            margin: 4px 2px;
            transition-duration: 0.4s;
            cursor: pointer;
            border: 2px solid #10228B;
            border-radius: 8px;
        }
        .button:hover {
            background: white;
            color: #10228B !important;
        }
        .center {
            display: block;
            margin-left: auto;
            margin-right: auto;
            width: 50%;
        }   
    </style>
</head>
<body>
    <img src="https://tv2api.traceverified.com/images/LOGO_of_TRACEVERIFIED.png" height="200"  class="center"/>
    <br/>
    <p>{{L"Email:Hello" model.company_name}},</p>
    <br/>
    <p>{{L"Email:ConfirmCreateQR:ThankUsing"}} <br/>{{L"Email:ConfirmCreateQR:Body"}}</p>
    <br/>
    <div>
        <a class="button" href="{{model.link}}">{{L "Email:ConfirmCreateQR:ButtonText"}}</a>
    </div>
    <br/>
    <p>{{L"Email:ConfirmCreateQR:TraceverifiedInfo"}} <br/>{{L"Email:ConfirmCreateQR:ThankEnd"}}</p>
    <br/>
    <p>{{L"Email:BestRegards"}}, <br/>Traceverified</p>
</body>
</html>