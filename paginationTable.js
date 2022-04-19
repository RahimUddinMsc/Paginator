// ************** READ ME ************** //

// This component takes a html table and dynamically adds pagination 
// Author - Rahim Uddin

// -------- PARAMETERS  --------
// Paramaters are sent to component in an object form e.g  Paginator.init({tableID:"table-one",headers:2, rows:2, navRange:5, navStyle:'default'});

//MANDATORY
// tableId: the id of the table that needs to be paginated

//OPTIONAL  
// headers: the number of headers rows that need to be omitted during pagination
// rows: max number of rows that should be displayed on each page
// navRange: max number of pages displayed in pagination navigation
// navStyle: the front end styling the navigation should take

//DEFAULT OPTIONAL PARAMETERS
//If optional paramaters are not passed component will use default values as per below (defaults can manually be adjusted in 'initDataset' function)
//headers : 1
//rows: 25
//nav range: 5
//navstyle: default 

// ************** READ ME ************** //


const ModelController = (() => {

    //Array that holds datase for each table on page specified in function call
    let tableSets = [];

    //state class for any tables created
    class TableState {
        constructor(id, data) {
            this.id = id;
            this.data = data;
        }
    }

    //return table state based on id 
    let getTableStateObj = id => {        
        for(let a = 0; a < tableSets.length; a++){
            if(tableSets[a].id == id){
                return tableSets[a]
            }
        }                
    }

    //gets the array index of object based on the id of the table
    let getTableStateIndex = id => {        
        for(let a = 0; a < tableSets.length; a++){
            if(tableSets[a].id == id){
                return a;
            }
        }                
    }

    //updates specific table in the table dataset based on the id
    let updateTableSet = (id,page) => {
        let table = getTableStateObj(id).data
        let curIndex = getTableStateIndex(id)
        table.page = page
        return tableSets[curIndex].data = table                
    }


    return {
        
        //Getters
        getTableDataset: () => tableSets,
        getTableState: id => getTableStateObj(id),
        
        //Setters                
        //creates a table state and adds it to the model dataset        
        createTableState : data => {
            let existsIndex = getTableStateIndex(data.tableID)
            if (existsIndex || existsIndex == 0) {
                tableSets[existsIndex] = new TableState(data.tableID, data)
            } else {
                tableSets.push(new TableState(data.tableID, data));
            }
            console.log(tableSets)
        },        

        //update table and global array dataset
        updateTableState: (id,page) => {
            return updateTableSet(id,page)
        }

    }

})();


const ViewController = (() => {

    //templates for nav
    let paginationNavHTML = data => {
        return `
        <div class = "pg-nav-container paginator-${data.tableID}" >
            <div class = "${data.navStyle}-pg-nav-content">
                <div class = "nav-first-page nav-single-op" data-dir="first">                                        
                    <span>First</span>
                </div>

                <div class = "btn-hz-spacer"></div>

                <div class = "nav-prev-page" data-dir="-1">                    
                    <span>Prev</span>            
                </div>

                <div class = "pg-hz-spacer"></div>

                <div class = "nav-pages-container">          
                </div>
                
                <div class = "pg-hz-spacer"></div>

                <div class = "nav-next-page" data-dir="1">                    
                    <span>Next</span>                                
                </div>

                <div class = "btn-hz-spacer"></div>

                <div class = "nav-last-page nav-single-op" data-dir="last">                    
                    <span>Last</span>                                                    
                </div>
        
            </div>
        
        </div>
        `
    }

    //populates the pagination nav with page numbers based on current page
    let navNumbersHTML = (data,start,end) => {                
        //if current page hits this function with then account for the fact 'last' page button clicked so reduce curpage by range siz        
        let htmlString = `<div class="pg-nav-numbers">`;
        for(b = start; b < end; b++){
            if(b <= data.maxPages){
                htmlString+= `<div class="pg-num-val" data-page=${b}>${b}</div>`
            }            
        }
        htmlString+="</div>"
        return htmlString
    }

    //gets all rows whilst excluding any headers
    let retrieveTableRows = data => {
        let rows = document.getElementById(data.tableID).querySelectorAll('tr')
        return rows = [...rows].slice(data.headers) 
    }

    //clears all rows barring any headers
    let clearAllRows = data =>{
        let rows = retrieveTableRows(data)
        rows.forEach(row => {
            // row.parentElement.removeChild(row)
            row.classList.add('pg-hide-row')            
        })
    }

    //adds the rows to the table
    let populateRows = (data,rows) => {
        let table = document.querySelector(data.domSelector)
        rows.forEach(row => {                        
            // table.appendChild(row)
            row.classList.remove('pg-hide-row')
        })
    }


    return {

        //Getters
        getTableRows: data => retrieveTableRows(data),

        //Setters        
        clearTableRows: data => clearAllRows(data),
        populateTableRows: (data,rows) => populateRows(data,rows),
        
        setupTableStyle: data => {
            let table = document.getElementById(data.tableID)
            if(!table.classList.contains(data.navStyle)){table.classList.add(data.navStyle)}
        },
        
        setupPaginationNav: data =>{                                       
            //create new pagination nav
            let table = document.getElementById(data.tableID)       
            let navDom = document.querySelector(`.paginator-${data.tableID}`)  
            if(navDom){navDom.parentElement.removeChild(navDom)}
            table.insertAdjacentHTML('afterend',paginationNavHTML(data))
        },

        setupPagesInNav: (data,start,end) =>{                   
            //if pagination nav exist delete it
            let pgNav = document.querySelector(`.paginator-${data.tableID} .pg-nav-numbers`)
            if(pgNav) {pgNav.parentElement.removeChild(pgNav)}
            
            //create new pagination nav            
            let navBlock = document.querySelector(`.paginator-${data.tableID} .nav-pages-container`)
            navBlock.insertAdjacentHTML('afterend',navNumbersHTML(data,start,end))
        },

        addNavActiveStyling: (data,pageNum) => {
            //loops through and remove active styling to any nav elements then add to it to element based on page number
            let pgNav = document.querySelector(`.paginator-${data.tableID}`)
            let pgEl;
            pgNav.querySelectorAll(`.paginator-${data.tableID} [data-page]`).forEach(el => {
                if(el.dataset.page == pageNum){
                    pgEl = el;
                }
                el.classList.remove(`pg-num-active`)
            })
            pgEl.classList.add(`pg-num-active`)
        }

    }

})();



const Paginator = ((modelCtrl,viewCtrl) => {    
    
    //loop through all the objects in the array and setup model states for table
    let initTable = data => {                
        initDataset(data);                
    
        //if only one page is present then no need for pagination else continue        
        if(data.maxPages == 1){return}

        viewCtrl.setupTableStyle(data);        
        setupPaginatedTable(data.tableID);                
        setupNavBlockWithBtns(data.tableID); 
        viewCtrl.setupPagesInNav(data,data.page,data.navRange+1)  
        viewCtrl.addNavActiveStyling(data,1)                     
        setupPageBtnListeners(data)
    }


    //creat a table oject state to and send to model to be used as a global for when requyired
    let initDataset = data => {                
        data.headers ? data.headers = data.headers : data.headers =  1;
        data.rowElems = viewCtrl.getTableRows(data);
        document.querySelector(`#${data.tableID} tbody`) ? data.domSelector = `#${data.tableID} tbody` : data.domSelector = data.tableID;        
        data.page = 1;        
        data.rows ? data.rows = data.rows : data.rows = 25;
        data.navRange ? data.navRange = data.navRange : data.navRange = 5;
        data.navStyle ? data.navStyle = data.navStyle : data.navStyle = 'default';
        data.maxPages = Math.ceil(data.rowElems.length / data.rows);        
        modelCtrl.createTableState(data);            
    }


    //sets up the new paginated table
    let setupPaginatedTable = id => {                
        let table = modelCtrl.getTableState(id).data
        let rowSet = getSelectedRowSet(id)
        viewCtrl.clearTableRows(table)
        viewCtrl.populateTableRows(table,rowSet)
        if(table.clickEvents){attachCustomListeners(table)}

    }


    //slice from original dataset what rows are required based on page and row select
    let getSelectedRowSet = id => {        
        let table = modelCtrl.getTableState(id).data        
        let startTrim = (table.page - 1) * table.rows
        let endTrim = startTrim + table.rows
        return table.rowElems.slice(startTrim,endTrim)        
    }   

    //adds any desired click event handlers
    let attachCustomListeners = (table) => {        
        //loop through all the click event objects
        table.clickEvents.forEach(click => {      
            //get the table element
            let domTable = document.getElementById(table.tableID)
            //add all the listeners to the event
            domTable.querySelectorAll(click.selector).forEach(eventElem => {                                
                //use dataset to ensure all lisetners are not added agauin
                if(!eventElem.dataset.eventAdded){
                    eventElem.addEventListener('click',e => {
                        //overide parameter if click event is requested
                        click.useClickObj ? click.event(e) : click.event()                                                
                    })
                }                
                eventElem.setAttribute('data-event-added', true);
            })            
        })
    }


    //sets up the paginator nav for the table and adds all listeners related to buttons
    let setupNavBlockWithBtns = id => {        
        let table = modelCtrl.getTableState(id).data      
        viewCtrl.setupPaginationNav(table);           

        //NEXT, PREV, FIRST, LAST BUTTONS
        document.querySelectorAll(`.paginator-${table.tableID} [data-dir]`).forEach(el => {
            el.addEventListener('click', e =>{
                handleNavClick(table.tableID,false,el.dataset.dir)
            })
        })
    }

    
    let setupPageBtnListeners = data => {
        //PAGE BUTTONS
        document.querySelectorAll(`.paginator-${data.tableID} [data-page]`).forEach(el => {
            el.addEventListener('click', e =>{
                handleNavClick(data.tableID,true,parseInt(el.dataset.page))
            })
        })
    }


    //performs table action based on which button was click
    let handleNavClick = (id, isPageNum, val) => {
        let table = modelCtrl.getTableState(id).data
        let nwPage = getPageValue(table,isPageNum,val)        
                
        //update the table
        table = modelCtrl.updateTableState(id,nwPage)                                    
        setupPaginatedTable(id)    

        //only perform nav dom refresh if max pages greater then nav range
        if(table.maxPages > table.navRange){
            let pos = getPageNavPos(id,nwPage)
            let newStart,end
            console.log(pos)

            //only do pagination refresh if first or last item clicked in nave
            if(pos == "first"){
                newStart = (nwPage+1) - table.navRange
                if(newStart <= 0) {newStart = 1}        
                viewCtrl.setupPagesInNav(table,newStart,newStart+table.navRange)          
                setupPageBtnListeners(table)  
            }else if(pos == "last"){
                if(val == "last"){
                    newStart = table.maxPages - table.navRange 
                    end = table.maxPages                     
                    viewCtrl.setupPagesInNav(table,newStart+1,end+1)            
                }else{
                    viewCtrl.setupPagesInNav(table,nwPage,nwPage+table.navRange)     
                }
                       
                setupPageBtnListeners(table)
            }
        }

        //add styling to current nav item clicked
        viewCtrl.addNavActiveStyling(table,nwPage)        
    }


    //set new page based on which button was clicked
    let getPageValue = (table, isPageNum,val) =>{        
        let nwPage;
        if (isPageNum){
            nwPage = val
        }else{
            if(val == "first"){
                nwPage = 1            
            }else if(val == "last"){
                nwPage = table.maxPages            
            }else{
                //icrement and decrement dependinng on if next/prev clicked
                nwPage = table.page += parseInt(val)                       
                if(nwPage < 1){
                    nwPage = 1
                }        
                if(nwPage > table.maxPages){
                    nwPage = table.maxPages
                }
            }
        }
        return nwPage
    }


    //looks at the nav position of the page number to determine its position in the nav
    let getPageNavPos = (id , pageNum) =>{
        let table = modelCtrl.getTableState(id).data

        //create number version of the dom items to match agains
        let navArr = []
        document.querySelectorAll(`.paginator-${table.tableID} [data-page]`).forEach(el => {  
            navArr.push(el.innerText)
        })
        
        //determines the position of number based on position in array
        let navStart = navArr[0]
        let navEnd = navArr[navArr.length-1]
        if(navStart == pageNum){
            return "first"
        }else if(navEnd == pageNum){
            if(navArr.length < table.navRange){
                return "mid"
            }else{
                return "last"
            }            
        }else{
            if(pageNum < navStart){
                return "first"
            }else if(pageNum > navEnd){
                return "last"
            }else{
                return "mid"
            }            
        }        
    }


    return {
        init: (data) => {
            initTable(data)            
            // setupAllDomTables(modelCtrl.getTableDataset())
        }          
    }

})(ModelController,ViewController);

