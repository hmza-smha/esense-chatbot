function createLoaderHTML (isDefault = false, hasIcon = false){
    const loaderStyle = isDefault ? "style='background-color:transparent !important'" : "";
    return `<div id='cbloader' class="cb-flexi-col">
        <div class="${isDefault ? 'cb-flex-center' : 'cb-width-60-per  cb-padding-10 align-items-end algin-self-end'} cb-flexi-col">
            <div class="chat-card">
                <label class="cb-flexi-col border-radius-8 cb-message gap-5 text-wrap" ${loaderStyle}>
                    <div class="spinner chat-spinner">
                        <div class="bounce1"></div>
                        <div class="bounce2"></div>
                        <div class="bounce3"></div>
                    </div>
                </label>
                <img src="${icon.avatar}" class="${hasIcon ? 'chat-avatar' : 'hide'}">
                </div>
        </div>
    </div>`;
};