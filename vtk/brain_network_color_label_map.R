# brain network and the group they belongs to
data1 <- as.matrix(read.table("brain_network_idx.txt", header=T, sep="\t"))
data1_idx <- data1[,-1]
class(data1_idx) <- "numeric"

num_net <- length(unique(data1[,4]))

data2 <- as.matrix(read.table("label_color_table.txt", header=F, sep="\t"))
data2_idx <- data2[,1]
data2_value <- data2[,c(3,4,5)]
class(data2_value) <- "numeric"
class(data2_idx) <- "numeric"
data3 <- as.matrix(read.table("brain_network_color_label.txt",header=F, sep="\t"))

for(i in 1:num_net)
{
	temp1 <- matrix(0, nrow=nrow(data2), ncol=3)
	idx1 <- data1_idx[which(data1_idx[,3] == i),1]
	idx2 <- data3[idx1,3]
	class(idx2) <- "numeric"
	idx3 <- which(data2_idx %in% idx2)
	temp1[idx3,] <- data2_value[idx3,]

	temp2 <- cbind(data2_idx, data2[,2], temp1, data2[,6])
	write.table(temp2, paste("label_color_table_", formatC(i, width=2, flag="0"),".txt", sep=""), col.names=F, row.names=F, quote=F, sep=" ")	
}

