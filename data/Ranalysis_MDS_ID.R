## R analysis for MDS results

################ first read in the data ######
setwd("/Applications/MAMP/htdocs/MDS_ID/data")
require('rstan')

## Data Analysis for MDS similarity ratings
## Jianhong Shen, Jun 2016
rm(list=ls())
graphics.off()
se <- function(x) {sd(x)/sqrt(length(x))}

# Load the data (Contains subjNums, dat)
# Specify the subfolder
pathname = "."    

# Specify the beginnings of files
filePattern = "*_MDS.csv"

# List the data files
fileNameVec = dir( path=pathname, pattern=filePattern )

# Number of subjs
nSubj = length(fileNameVec) 
nbird = 20; ntrial = 300
id_index = c(2:301)
subj=1
#dat=NULL  # use this one if dat is a big data frame
dat=list() # use this one if dat is a list with each participant's data as an elment of the list
id_vars = c('response','rt','bird','class','family','acc')
subnames = matrix(unlist(strsplit(fileNameVec,'_')),ncol=7,byrow = T)[,1]
id = array(NA,dim=c(length(id_vars),nSubj,ntrial),dimnames = list(id_vars,subnames))
lengthn = rep_len(NA,nSubj)

for ( subj in 1:nSubj ) {
  
  dataFileName = paste(pathname, "/", fileNameVec[subj], sep="" )
  dat[[subj]] = read.csv(dataFileName,stringsAsFactors = F)
  id_tmp = dat[[subj]]$responses[id_index]
  id_tmp[id_tmp=="{}"] = '{\"Q0\":\"NULL\"}'
  id['response',subj,] = matrix(unlist(strsplit(id_tmp,'"')),nrow=ntrial,byrow = T)[,4]
  lengthn[subj] = length(unlist(strsplit(id_tmp, "\"")))
  id['rt',subj,] = dat[[subj]]$rt[id_index]
  id['bird',subj,] = dat[[subj]]$bird[id_index]
  id['acc',subj,] = as.numeric(id['bird',subj,]==id['response',subj,])
  id['class',subj,] = dat[[subj]]$class[id_index]
  id['family',subj,] = dat[[subj]]$family[id_index]
}


id_score = apply(id['acc',,],1,function(x) {sum(as.numeric(x))})
## calculate 
birds = unique(id['bird',1,])
id_MDS = array(0,dim=c(nSubj,nbird,nbird),dimnames = list(subnames,birds,birds))
for (subi in subnames) {
  for (i in birds){
    for (j in birds) {
      id_MDS[subi,i,j] = sum(id['bird',subi,]==i & id['response',subi,]==j)
    }
  }
}
print(apply(id_MDS,1,sum)[which(apply(id_MDS,1,sum)!=300)])


save(id_MDS,id,file='dat_MDS_ID.Rdata')

##########MDS in R ###########
# library("smacof")
# data("perception")
# res1 = smacofIndDiff(dist, constraint = "indscal", ndim=3)   ## diagonally restricted weights
# summary(res1)
# 
# xy <- res1$gspace
# 
# require('jpeg')
# ims = dir(path="/Applications/MAMP/htdocs/MDS/img",pattern='0*.jpg',recursive = T)
# tmp = matrix(unlist(strsplit(ims,split='[/.]')),nrow=length(ims),byrow=T)
# ims_plot = list()
# 
# for (i in 1:length(birds)) {
#   birdi = birds[i]
#   imsi = ims[sample(which(tmp[,1]==birdi,arr.ind = T),1)]
#   ims_plot[[i]] = readJPEG(paste("/Applications/MAMP/htdocs/MDS/img/",imsi,sep=""))
# }
# 
# thumbnails <- function(x, y, images, width = 0.1*diff(range(x)), 
#                        height = 0.1*diff(range(y))){
#   
#   # images <- replicate(length(x), images, simplify=FALSE)
#   stopifnot(length(x) == length(y))
#   
#   for (ii in seq_along(x)){
#     rasterImage(images[[ii]], xleft=x[ii] - 0.5*width,
#                 ybottom= y[ii] - 0.5*height,
#                 xright=x[ii] + 0.5*width, 
#                 ytop= y[ii] + 0.5*height, interpolate=FALSE)
#   }
# }
# 
# pdf(file="../mds.pdf")
# plot(xy[,c(1,2)], t="n")
# thumbnails(xy[,1], xy[,2], ims_plot)
# plot(xy[,c(1,3)], t="n")
# thumbnails(xy[,1], xy[,3], ims_plot)
# plot(xy[,c(2,3)], t="n")
# thumbnails(xy[,2], xy[,3], ims_plot)
# dev.off()
# 
# ### do item analysis to see if there are weird items  ########
# 
# library(reshape2)
# data = melt(sim['response',,]); 
# colnames(data) = c("person","item","y")
# data$y = as.numeric(data$y)
# data$item = as.character(data$item)
# 
# data_sim = acast(data,person~item)
# data_sim = data_sim
# plot(id_score,apply(data_sim,1,sd))
