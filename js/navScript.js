menu.onclick=function myFunction(){
    let x=document.getElementById('myTopNav');
    if(x.className ==='topNav'){
        x.className+=' responsive';
    }else{
        x.className='topNav';
    };
};