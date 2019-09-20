const TEMPLATE = `
	{{#articleUrl}} 
    <div class="baikeplugin-body baikeplugin-theme-{{theme}}">
        <div class="baikeplugin-image" style="background:url('{{image}}') no-repeat center center; background-size: cover; height:{{imageHeight}}px"></div>
        {{{body}}}
        <div class="bottom-fade"/>
    </div>	
    <div class="baikeplugin-footer">
        <a style="color: #59ABE3" href="{{articleUrl}}" target="_blank">${chrome.i18n.getMessage("readMore")}</a>
    </div>
	{{/articleUrl}} 
	{{^articleUrl}}
	    <div class="baikeplugin-body-none baikeplugin-theme-{{theme}}">
        {{{body}}}
    </div>	
	{{/articleUrl}} 
`;