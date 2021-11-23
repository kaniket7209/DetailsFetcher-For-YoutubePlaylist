This script will let You find the total time of the playlist that you wish and that also upon your choice.
Suppose Youtube Playlist has 14 videos , and you just wish to find out the length of first 7 videos length , So this code will do it.
<!-- Note -> Install puppeteer first with npm i puppeteer -->
<!-- FORMAT BELOW -->
node main.js PlaylistLink CountOfVideos Options(print/pdf) 
1) if you just write node main.js urlLink then it will display Total no of videos | Total views | Playlist name 
2) If you provide the countOFVideo also then it will display the Total Length of video in Hrs and minutes 
3) Display error if url not provided 
4) wait if user not entered count of videos but display the details as in 1)
5) display details if user typed "print" after option
6) wrap up the details in pdf and pdf will be made storing details

<!-- Note the order-->
node main.js playlistlink countOfVideos Options

So first write node main.js then urlLink then COunt of Videos then Options(print/pdf)
