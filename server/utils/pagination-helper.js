var userPaginator = (total_rec,curr_page,per_page)=>{

    let total_links =  total_rec / per_page;
    var link_array = Array();
    var i;
    var num_li_const = 5;
    //add first link
    if(total_links>2 && curr_page!='1'){
            
        var first_link = "<li class='"+ act_cls +"'><a href='/getUser'>Fisrt</a></li>"
        link_array.push({
            'link':first_link
        });
    }

    //add previous link
    if(total_links>2 && curr_page>1){
        var prev_link = '/getUser?page='+(curr_page-1);
        var prev_link_li = "<li class='"+ act_cls +"'><a href='"+prev_link+"'><<</a></li>";
        link_array.push({
            'link':prev_link_li
        });
    }


    var li_link;
    //impliment case wise condition
    //case 1: if current page vary between 1-5 and total pages are <=10
    if(curr_page>=1 && curr_page<=num_li_const && (curr_page+num_li_const)>=total_links){

        for(i=1; i<=total_links; i++){

            if(i == curr_page){
                var act_cls = "active";
                var url = "";
            }else{
                var act_cls = "";
                var url = "/getUser?page="+i;
            }

            li_link = "<li class='"+ act_cls +"'><a href='"+url+"'>"+(i)+"</a></li>";
            link_array.push({
                'link':li_link
            });
        }
    }else if(curr_page>=1 && curr_page<=num_li_const && (curr_page+num_li_const)<total_links){
        //case 2: if current page vary between 1-5 and total pages are >10
        for(i=1; i<=(curr_page+(num_li_const-1)); i++){
            if(i == curr_page){
                var act_cls = "active";
                var url = "";
            }else{
                var act_cls = "";
                var url = "/getUser?page="+i;
            }

            li_link = "<li class='"+ act_cls +"'><a href='"+url+"'>"+(i)+"</a></li>";
            link_array.push({
                'link':li_link
            });
        }
            li_link = "<li class='disabled'><a href=''>...</a></li>";
            link_array.push({
                'link':li_link
            });
    }else if((curr_page-num_li_const)>=1 && (curr_page+num_li_const)<=total_links){
        //case 3: if current page >6 and <(totat record-5)//...6,7,8,9,10,...
        li_link = "<li class='disabled'><a href=''>...</a></li>";
        link_array.push({
            'link':li_link
        });
        for(i=(curr_page-(num_li_const-1)); i<=(curr_page+(num_li_const-1)); i++){
            if(i == curr_page){
                var act_cls = "active";
                var url = "";
            }else{
                var act_cls = "";
                var url = "/getUser?page="+i;
            }

            li_link = "<li class='"+ act_cls +"'><a href='"+url+"'>"+(i)+"</a></li>";
            link_array.push({
                'link':li_link
            });
        }
        li_link = "<li class='disabled'><a href=''>...</a></li>";
        link_array.push({
            'link':li_link
        });
            
    }else if((curr_page+num_li_const)>total_links && (curr_page-num_li_const)>=1){
        //case 4: if current page >6 and >(totat record-5)//...6,7,8,9,10
        li_link = "<li class='disabled'><a href=''>...</a></li>";
        link_array.push({
            'link':li_link
        });
        for(i=(curr_page-(num_li_const-1)); i<=total_links; i++){
            //remove link form active pagination and add active class
            if(i == curr_page){
                var act_cls = "active";
                var url = "";
            }else{
                var act_cls = "";
                var url = "/getUser?page="+i;
            }
    
            var li_link = "<li class='"+ act_cls +"'><a href='"+url+"'>"+(i)+"</a></li>";
            link_array.push({
                'link':li_link
            });
        }
    }

    

    //add next link
    if(total_links>2 && curr_page<(total_links)){
        var next_link = '/getUser?page='+(curr_page+1);
        var next_link_li = "<li class='"+ act_cls +"'><a href='"+next_link+"'>>></a></li>";
        link_array.push({
            'link':next_link_li
        });
    }

    //add last link
    if(total_links>2 && curr_page!=(total_links)){
            
        var last_link_li = "<li class='"+ act_cls +"'><a href='/getUser?page="+(total_links)+"'>Last</a></li>";
        link_array.push({
            'link':last_link_li
        });
    }
    return link_array;
}

module.exports = {
    userPaginator
}