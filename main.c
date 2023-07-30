///////////
// Setup //
///////////

// Function implemented in Javascript
void print(char* msg);
float sqrt(float number);

// Our memory allocator
extern unsigned char __heap_base;
unsigned char* bump_pointer = &__heap_base;

void* c_malloc(int n)
{
	unsigned char* r = bump_pointer;
	bump_pointer += n;
	return (void *)r;
}

void c_free(void* p)
{
	// Not implemented yet
}

////////////////////
// Test Functions //
////////////////////

int add(int a, int b)
{
	print("In C add()\n");
	return a + b;
}

int sum(int a[], int len)
{
	print("In C sum()\n");
  	int sum = 0;
  	for (int i = 0; i < len; i++)
	{
    	sum += a[i];
	}

	return sum;
}

float square_root(float number)
{
	print("In C square_root()\n");
	return sqrt(number);
}

char* reverse(char* msg, int len)
{
	print(msg);
	char* result = c_malloc(len + 1);
	result[len] = 0;
	for (int i = 0; i < len; ++i)
	{
		result[len - 1 - i] = msg[i];
	}

	return result;
}

////////////////
// Mandelbrot //
////////////////

double minR;
double maxR;
double minI;
double maxI;
int maxIterations;
int canvasWidth;
int canvasHeight;

double map(double value, double minin, double maxin, double minout, double maxout)
{
	return minout + (value - minin) / (maxin - minin) * (maxout - minout);
}

void initMandel(double minr, double maxr, double mini, double maxi, int maxiterations, int width, int height)
{
	minR = minr;
	maxR = maxr;
	minI = mini;
	maxI = maxi;
	maxIterations = maxiterations;
	canvasWidth = width;
	canvasHeight = height;
}

int calcPixel(int x, int y)
{
	double x0 = map((double)x, 0.0, (double)canvasWidth - 1, minR, maxR);
	double y0 = map((double)y, 0.0, (double)canvasHeight - 1, minI, maxI);

	double a = 0;
	double b = 0;
	double rx = 0;
	double ry = 0;
 
	int iterations = 0;
	while (iterations < maxIterations && (rx * rx + ry * ry <= 4.0)) 
	{
		rx = a * a - b * b + x0;
		ry = 2 * a * b + y0;

		a = rx;
		b = ry;
		iterations++;
	}

	return iterations;
}
